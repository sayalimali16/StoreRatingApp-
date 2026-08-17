const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026_x987';

/**
 * Middleware to verify JWT token in Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Require System Admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. System Administrator privileges required.' });
  }
  next();
}

/**
 * Require Normal User role
 */
function requireNormalUser(req, res, next) {
  if (!req.user || req.user.role !== 'NORMAL_USER') {
    return res.status(403).json({ success: false, message: 'Access denied. Normal User privileges required.' });
  }
  next();
}

/**
 * Require Store Owner role
 */
function requireStoreOwner(req, res, next) {
  if (!req.user || req.user.role !== 'STORE_OWNER') {
    return res.status(403).json({ success: false, message: 'Access denied. Store Owner privileges required.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireNormalUser,
  requireStoreOwner,
  JWT_SECRET
};
