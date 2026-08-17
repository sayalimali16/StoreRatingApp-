const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById } = require('../controllers/storeController');
const { authenticateToken } = require('../middleware/auth');

// Optional auth token check to attach user_rating if logged in
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}

router.get('/', optionalAuth, getAllStores);
router.get('/:id', optionalAuth, getStoreById);

module.exports = router;
