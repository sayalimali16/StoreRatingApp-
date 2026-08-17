const { query } = require('../config/db');
const { validateRating } = require('../utils/validation');

/**
 * Submit or Update Store Rating by Normal User
 */
async function submitOrUpdateRating(req, res) {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required.' });
    }

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ success: false, message: ratingErr });
    }

    const numericRating = parseInt(rating, 10);

    // Verify store exists
    const [storeCheck] = await query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if user has already rated this store
    const [existingRating] = await query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let isNewRating = false;
    if (existingRating.length > 0) {
      // Update rating
      await query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
        [numericRating, userId, storeId]
      );
    } else {
      // Insert new rating
      isNewRating = true;
      await query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, numericRating]
      );
    }

    // Calculate updated store overall rating
    const [avgResult] = await query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    const newAvg = avgResult[0].avg_rating ? parseFloat(avgResult[0].avg_rating).toFixed(2) : '0.00';
    const totalCount = avgResult[0].total_ratings;

    return res.json({
      success: true,
      message: isNewRating ? 'Rating submitted successfully.' : 'Rating modified successfully.',
      data: {
        storeId,
        userRating: numericRating,
        overallRating: newAvg,
        totalRatings: totalCount
      }
    });
  } catch (err) {
    console.error('Submit rating error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit rating.', error: err.message });
  }
}

/**
 * Get user's rating for a specific store
 */
async function getUserRatingForStore(req, res) {
  try {
    const userId = req.user.id;
    const storeId = req.params.storeId;

    const [rows] = await query(
      'SELECT id, rating, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, rating: null });
    }

    return res.json({ success: true, rating: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch rating.', error: err.message });
  }
}

module.exports = {
  submitOrUpdateRating,
  getUserRatingForStore
};
