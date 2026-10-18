const router = require('express').Router();
const pool = require('../db');
const { auth, role } = require('../middleware/auth');
const { notifyUser, STATUSES, STATUS_LABEL } = require('../notify');

router.use(auth, role('admin'));

// Builds a WHERE clause from the dashboard filters.
function buildWhere(q, user, params) {
  const where = [];
  const add = (sql, v) => { params.push(v); where.push(sql.split('?').join('$' + params.length)); };
  if (q.sector_id) add('c.sector_id = ?', q.sector_id);
  if (q.ward_id) add('c.ward_id = ?', q.ward_id);
  if (q.status) add('c.status = ?', q.status);
  if (q.from) add('c.created_at >= ?', q.from);
  if (q.to) add("c.created_at < (?::date + 1)", q.to);
  if (q.search) add('(c.title ILIKE ? OR c.reference ILIKE ?)', `%${q.search}%`);
  return where.length ? 'WHERE ' + where.join(' AND ') : '';
}

router.get('/complaints', async (req, res, next) => {
  try {
    const params = [];
    const where = buildWhere(req.query, req.user, params);
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM complaints c ${where}`, params);
    const { rows } = await pool.query(
      `SELECT c.id, c.reference, c.title, c.status, c.created_at, s.name AS sector_name, w.name AS ward_name, u.full_name AS citizen_name
       FROM complaints c JOIN sectors s ON s.id=c.sector_id JOIN wards w ON w.id=c.ward_id JOIN users u ON u.id=c.citizen_id
       ${where} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      params
    );
    res.json({ rows, total: total.rows[0].n, page, pages: Math.ceil(total.rows[0].n / limit) || 1 });
  } catch (e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const params = [];
    const where = buildWhere(req.query, req.user, params);
    const run = (sql) => pool.query(sql, params).then((r) => r.rows);

    const [byStatus, bySector, byWard, trend, rating] = await Promise.all([
      run(`SELECT c.status, COUNT(*)::int AS count FROM complaints c ${where} GROUP BY c.status`),
      run(`SELECT s.name, COUNT(*)::int AS count FROM complaints c JOIN sectors s ON s.id=c.sector_id ${where} GROUP BY s.name ORDER BY count DESC LIMIT 10`),
      run(`SELECT w.name, COUNT(*)::int AS count FROM complaints c JOIN wards w ON w.id=c.ward_id ${where} GROUP BY w.name ORDER BY count DESC LIMIT 10`),
      run(`SELECT to_char(c.created_at::date,'YYYY-MM-DD') AS date, COUNT(*)::int AS count FROM complaints c ${where} GROUP BY 1 ORDER BY 1`),
      run(`SELECT ROUND(AVG(f.rating),2)::float AS avg, COUNT(f.id)::int AS n FROM complaints c JOIN feedback f ON f.complaint_id=c.id ${where}`),
    ]);

    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    byStatus.forEach((r) => (counts[r.status] = r.count));
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    res.json({
      total, counts,
      status: STATUSES.map((s) => ({ key: s, name: STATUS_LABEL[s], count: counts[s] })),
      bySector, byWard, trend,
      rating: rating[0],
      resolutionRate: total ? Math.round((counts.resolved / total) * 100) : 0,
    });
  } catch (e) { next(e); }
});

// Update status (Submitted -> Under Review -> In Progress -> Resolved / Rejected)
router.patch('/complaints/:id/status', async (req, res, next) => {
  const { status, note } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (status === 'rejected' && !note?.trim()) return res.status(400).json({ error: 'Add a reason when rejecting a request' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [c] } = await client.query('SELECT * FROM complaints WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!c) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Request not found' }); }
    await client.query(
      `UPDATE complaints SET status=$1, updated_at=now(), resolved_at = CASE WHEN $1='resolved' THEN now() ELSE NULL END WHERE id=$2`,
      [status, c.id]
    );
    await client.query('INSERT INTO complaint_updates(complaint_id,status,note,updated_by) VALUES ($1,$2,$3,$4)',
      [c.id, status, note || null, req.user.id]);
    await notifyUser(client, c.citizen_id, c.id, `Request ${STATUS_LABEL[status]}`,
      `${c.reference} is now "${STATUS_LABEL[status]}".${note ? ' ' + note : ''}`);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally {
    client.release();
  }
});

// Move a complaint to a different sector if the resident picked the wrong one
router.patch('/complaints/:id/sector', async (req, res, next) => {
  try {
    const { sector_id } = req.body;
    const { rows: [c] } = await pool.query('UPDATE complaints SET sector_id=$1, updated_at=now() WHERE id=$2 RETURNING *', [sector_id, req.params.id]);
    if (!c) return res.status(404).json({ error: 'Request not found' });
    await pool.query('INSERT INTO complaint_updates(complaint_id,status,note,updated_by) VALUES ($1,$2,$3,$4)',
      [c.id, c.status, 'Moved to a different sector', req.user.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
