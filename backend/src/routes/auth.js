const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../db');
const { auth, sign } = require('../middleware/auth');
const { sendMail } = require('../mailer');

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

// The identifier can be an email address or a national ID number
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

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Emails a link that is valid for one hour. The reply is the same whether or not the account exists.
router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Enter your email address' });
    const { rows: [user] } = await pool.query('SELECT id, full_name, email FROM users WHERE lower(email)=$1', [email]);
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await pool.query("INSERT INTO password_resets(user_id, token_hash, expires_at) VALUES ($1,$2, now() + interval '1 hour')", [user.id, hashToken(token)]);
      const base = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
      const link = `${base}/reset-password?token=${token}`;
      sendMail({
        to: user.email,
        subject: "Reset your Murang'a County account password",
        text: `Hello ${user.full_name},\n\nUse this link to choose a new password. It expires in one hour.\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
        html: `<p>Hello ${user.full_name},</p><p>Use the link below to choose a new password. It expires in one hour.</p><p><a href="${link}">Reset my password</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
      }).catch((err) => console.error('Could not send reset email:', err.message));
    }
    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (e) { next(e); }
});

// Sets a new password when the link's token is valid, unused and not expired
router.post('/reset-password', async (req, res, next) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Enter a new password' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [reset] } = await client.query(
      'SELECT user_id FROM password_resets WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now() FOR UPDATE',
      [hashToken(token)]
    );
    if (!reset) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }
    await client.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(password, 10), reset.user_id]);
    await client.query('UPDATE password_resets SET used_at=now() WHERE user_id=$1 AND used_at IS NULL', [reset.user_id]);
    await client.query('COMMIT');
    res.json({ message: 'Your password has been changed. You can now log in.' });
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally {
    client.release();
  }
});

module.exports = router;
