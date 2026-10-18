const router = require('express').Router();
const pool = require('../db');

router.get('/sectors', async (req, res, next) => {
  try { res.json((await pool.query('SELECT id, slug, name, description FROM sectors ORDER BY name')).rows); } catch (e) { next(e); }
});
router.get('/wards', async (req, res, next) => {
  try { res.json((await pool.query('SELECT id, name, sub_county FROM wards ORDER BY sub_county, name')).rows); } catch (e) { next(e); }
});
// Public tracking by reference number. Returns status only: no resident details, no notes.
router.get('/track/:reference', async (req, res, next) => {
  try {
    const { rows: [c] } = await pool.query(
      `SELECT c.id, c.reference, c.status, c.created_at, c.updated_at, s.name AS sector_name, w.name AS ward_name
       FROM complaints c JOIN sectors s ON s.id=c.sector_id JOIN wards w ON w.id=c.ward_id WHERE c.reference=$1`,
      [req.params.reference.trim().toUpperCase()]
    );
    if (!c) return res.status(404).json({ error: 'We could not find a request with that reference number' });
    const { rows: updates } = await pool.query('SELECT status, created_at FROM complaint_updates WHERE complaint_id=$1 ORDER BY created_at', [c.id]);
    const { id, ...pub } = c;
    res.json({ ...pub, updates });
  } catch (e) { next(e); }
});

router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
