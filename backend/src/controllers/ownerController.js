const { query } = require('../config/db');

/**
 * Store Owner Dashboard Stats & Store Details
 */
async function getOwnerDashboard(req, res) {
  try {
    const ownerId = req.user.id;

    // Fetch store owned by this user
    const [stores] = await query(
      `SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?`,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.json({
        success: true,
        hasStore: false,
        message: 'No store is currently assigned to your account.'
      });
    }

    const store = stores[0];

    // Fetch store rating statistics
    const [stats] = await query(
      `SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(id) as total_ratings,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
       FROM ratings
       WHERE store_id = ?`,
      [store.id]
    );

    const ratingStats = stats[0];

    return res.json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: ratingStats.total_ratings > 0 ? parseFloat(ratingStats.average_rating).toFixed(2) : 'No Ratings',
        totalRatings: ratingStats.total_ratings,
        distribution: {
          5: ratingStats.star_5 || 0,
          4: ratingStats.star_4 || 0,
          3: ratingStats.star_3 || 0,
          2: ratingStats.star_2 || 0,
          1: ratingStats.star_1 || 0
        }
      }
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load owner dashboard.', error: err.message });
  }
}

/**
 * View users who submitted ratings for the store owner's store
 */
async function getStoreRatingsList(req, res) {
  try {
    const ownerId = req.user.id;
    const { search = '', sortBy = 'updated_at', sortOrder = 'DESC' } = req.query;

    // Fetch store owned by this user
    const [stores] = await query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'No assigned store found.' });
    }

    const storeId = stores[0].id;

    const allowedSort = {
      user_name: 'u.name',
      rating: 'r.rating',
      updated_at: 'r.updated_at'
    };

    const sortColumn = allowedSort[sortBy] || 'r.updated_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let sql = `
      SELECT 
        r.id as rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `;

    const params = [storeId];

    if (search.trim()) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const [ratings] = await query(sql, params);

    const formattedRatings = ratings.map(r => ({
      ratingId: r.rating_id,
      rating: r.rating,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      user: {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email,
        address: r.user_address
      }
    }));

    return res.json({ success: true, count: formattedRatings.length, ratings: formattedRatings });
  } catch (err) {
    console.error('Owner ratings list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rating submitters.', error: err.message });
  }
}

module.exports = {
  getOwnerDashboard,
  getStoreRatingsList
};
