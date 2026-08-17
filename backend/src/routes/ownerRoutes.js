const express = require('express');
const router = express.Router();
const { getOwnerDashboard, getStoreRatingsList } = require('../controllers/ownerController');
const { authenticateToken, requireStoreOwner } = require('../middleware/auth');

router.use(authenticateToken, requireStoreOwner);

router.get('/dashboard', getOwnerDashboard);
router.get('/ratings', getStoreRatingsList);

module.exports = router;
