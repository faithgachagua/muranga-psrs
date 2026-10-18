const router = require('express').Router();
const pool = require('../db');
const { auth, role } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../cloudinary');
const { notifyUser, notifyAdmins } = require('../notify');

const BASE_SELECT = `
  SELECT c.*, s.name AS sector_name, s.slug AS sector_slug, w.name AS ward_name, w.sub_county, u.full_name AS citizen_name,
         f.rating, f.comment AS feedback_comment
  FROM complaints c
  JOIN sectors s ON s.id = c.sector_id
  JOIN wards w ON w.id = c.ward_id
  JOIN users u ON u.id = c.citizen_id
  LEFT JOIN feedback f ON f.complaint_id = c.id`;

// Creates a request. Photos go to Cloudinary first, then everything is saved in one transaction.
router.post('/', auth, role('citizen'), (req, res, next) =>
  upload.array('photos', 5)(req, res, (err) => (err ? res.status(400).json({ error: err.message }) : next())),
  async (req, res, next) => {
    const { sector_id, ward_id, title, description, location_details } = req.body;
    const toNumber = (v) => (v === undefined || v === '' ? null : Number(v));
    const latitude = toNumber(req.body.latitude);
    const longitude = toNumber(req.body.longitude);
    if (!sector_id || !ward_id || !title?.trim() || !description?.trim())
      return res.status(400).json({ error: 'Choose a sector and ward, and add a title and description' });
    if (description.length > 500) return res.status(400).json({ error: 'Description must be 500 characters or fewer' });
    const hasPoint = latitude !== null || longitude !== null;
    if (hasPoint && !(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180))
      return res.status(400).json({ error: 'The GPS location is not valid' });

    const files = req.files || [];
    if (files.length && !cloudinary.isConfigured())
      return res.status(503).json({ error: 'Photo uploads are not available right now. Send the request without photos.' });

    const results = await Promise.allSettled(files.map((f) => cloudinary.uploadImage(f.buffer)));
    const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    if (uploaded.length !== files.length) {
      await cloudinary.deleteImages(uploaded.map((u) => u.public_id));
      return res.status(502).json({ error: 'Photo upload failed. Please try again.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [c] } = await client.query(
        `INSERT INTO complaints(reference,citizen_id,sector_id,ward_id,title,description,location_details,latitude,longitude)
         VALUES ('MCG-'||to_char(now(),'YYYY')||'-'||lpad(nextval('complaint_ref_seq')::text,6,'0'),$1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [req.user.id, sector_id, ward_id, title.trim(), description.trim(), location_details || null, latitude, longitude]
      );
      for (const u of uploaded) {
        await client.query('INSERT INTO complaint_photos(complaint_id,url,public_id,size) VALUES ($1,$2,$3,$4)', [c.id, u.secure_url, u.public_id, u.bytes]);
      }
      await client.query('INSERT INTO complaint_updates(complaint_id,status,note,updated_by) VALUES ($1,$2,$3,$4)',
        [c.id, 'submitted', 'Request received', req.user.id]);
      await notifyUser(client, req.user.id, c.id, 'Request received',
        `Your request ${c.reference} has been received by the county administration.`);
      const { rows: [sec] } = await client.query('SELECT name FROM sectors WHERE id=$1', [c.sector_id]);
      await notifyAdmins(client, c.id, 'New request', `${c.reference} (${sec.name}): ${c.title}`);
      await client.query('COMMIT');
      res.status(201).json(c);
    } catch (e) {
      await client.query('ROLLBACK');
      await cloudinary.deleteImages(uploaded.map((u) => u.public_id));
      next(e);
    } finally {
      client.release();
    }
  }
);

// A citizen's own requests
router.get('/mine', auth, role('citizen'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${BASE_SELECT} WHERE c.citizen_id=$1 ORDER BY c.created_at DESC`, [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

// One request with its photos and history; visible to its owner and to administrators
router.get('/:id', auth, async (req, res, next) => {
  try {
    const { rows: [c] } = await pool.query(`${BASE_SELECT} WHERE c.id=$1`, [req.params.id]);
    if (!c) return res.status(404).json({ error: 'Request not found' });
    const u = req.user;
    const allowed = u.role === 'admin' || c.citizen_id === u.id;
    if (!allowed) return res.status(403).json({ error: 'You do not have access to this request' });
    const [photos, upd] = await Promise.all([
      pool.query('SELECT id, url FROM complaint_photos WHERE complaint_id=$1 ORDER BY id', [c.id]),
      pool.query(`SELECT cu.*, us.full_name AS by_name FROM complaint_updates cu LEFT JOIN users us ON us.id=cu.updated_by
                  WHERE complaint_id=$1 ORDER BY cu.created_at`, [c.id]),
    ]);
    res.json({ ...c, photos: photos.rows, updates: upd.rows });
  } catch (e) { next(e); }
});

// Rating and comment from the citizen once a request is resolved
router.post('/:id/feedback', auth, role('citizen'), async (req, res, next) => {
  try {
    const rating = parseInt(req.body.rating, 10);
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Choose a rating from 1 to 5' });
    const { rows: [c] } = await pool.query('SELECT * FROM complaints WHERE id=$1 AND citizen_id=$2', [req.params.id, req.user.id]);
    if (!c) return res.status(404).json({ error: 'Request not found' });
    if (c.status !== 'resolved') return res.status(400).json({ error: 'You can rate a request once it is resolved' });
    const dup = await pool.query('SELECT 1 FROM feedback WHERE complaint_id=$1', [c.id]);
    if (dup.rowCount) return res.status(409).json({ error: 'You have already rated this request' });
    await pool.query('INSERT INTO feedback(complaint_id,citizen_id,rating,comment) VALUES ($1,$2,$3,$4)',
      [c.id, req.user.id, rating, req.body.comment || null]);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
