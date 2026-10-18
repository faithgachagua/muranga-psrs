const router = require('express').Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    res.json((await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [req.user.id])).rows);
  } catch (e) { next(e); }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    res.json({ count: (await pool.query('SELECT COUNT(*)::int AS n FROM notifications WHERE user_id=$1 AND NOT is_read', [req.user.id])).rows[0].n });
  } catch (e) { next(e); }
});

router.patch('/read-all', async (req, res, next) => {
  try { await pool.query('UPDATE notifications SET is_read=TRUE WHERE user_id=$1', [req.user.id]); res.json({ ok: true }); } catch (e) { next(e); }
});

router.patch('/:id/read', async (req, res, next) => {
  try { await pool.query('UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]); res.json({ ok: true }); } catch (e) { next(e); }
});

module.exports = router;
