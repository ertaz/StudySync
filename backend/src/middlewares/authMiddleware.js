const { verifyAccessToken } = require('../utils/tokenUtils');
 
// ── Verify JWT access token ───────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
 
  if (!token) {
    return res.status(401).json({ message: 'Access token missing.' });
  }
 
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Access token is invalid or expired.' });
  }
};
 
// ── Role-based access control ─────────────────────────────────
// Usage: authorize('admin') or authorize('admin', 'professor')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    next();
  };
};
 
module.exports = { authenticate, authorize };