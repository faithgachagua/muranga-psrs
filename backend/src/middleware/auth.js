const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in to continue' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again' });
  }
};

// Restricts a route to the given roles
exports.role = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have access to this' });

exports.sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.full_name }, process.env.JWT_SECRET, { expiresIn: '7d' });
