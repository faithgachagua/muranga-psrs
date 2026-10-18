const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { auth, sign } = require('../middleware/auth');

const publicUser = (u) => ({ id: u.id, full_name: u.full_name, email: u.email, national_id: u.national_id, role: u.role, ward_id: u.ward_id });

router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, national_id, phone, password, ward_id } = req.body;
    if (!full_name || !email || !national_id || !password) return res.status(400).json({ error: 'Name, email, ID number and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const exists = await pool.query('SELECT 1 FROM users WHERE lower(email)=lower($1) OR national_id=$2', [email, national_id]);
    if (exists.rowCount) return res.status(409).json({ error: 'An account with this email or ID number already exists' });
    const { rows: [u] } = await pool.query(
      `INSERT INTO users(full_name,email,national_id,phone,password_hash,role,ward_id)
       VALUES ($1,lower($2),$3,$4,$5,'citizen',$6) RETURNING *`,
      [full_name.trim(), email.trim(), national_id.trim(), phone || null, await bcrypt.hash(password, 10), ward_id || null]
    );
    res.status(201).json({ token: sign(u), user: publicUser(u) });
  } catch (e) { next(e); }
});

// identifier = email OR national ID
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'Enter your email or ID number and your password' });
    const { rows: [u] } = await pool.query('SELECT * FROM users WHERE lower(email)=lower($1) OR national_id=$1', [identifier.trim()]);
    if (!u || !(await bcrypt.compare(password, u.password_hash))) return res.status(401).json({ error: 'Incorrect email/ID number or password' });
    res.json({ token: sign(u), user: publicUser(u) });
  } catch (e) { next(e); }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const { rows: [u] } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
    if (!u) return res.status(404).json({ error: 'Account not found' });
    res.json(publicUser(u));
  } catch (e) { next(e); }
});

module.exports = router;
