require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set');
  process.exit(1);
}

// Browser origins allowed to call the API (comma separated in CLIENT_URL)
const origins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((o) => o.trim().replace(/\/$/, ''));

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, !origin || origins.includes(origin)) }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

app.use('/api', require('./routes/meta'));
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on port ${port}`));
