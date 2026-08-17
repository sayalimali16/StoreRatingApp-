const express = require('express');
const router = express.Router();
const { submitOrUpdateRating, getUserRatingForStore } = require('../controllers/ratingController');
const { authenticateToken, requireNormalUser } = require('../middleware/auth');

// Rating actions require Normal User authentication
router.post('/', authenticateToken, requireNormalUser, submitOrUpdateRating);
router.get('/:storeId', authenticateToken, getUserRatingForStore);

module.exports = router;
