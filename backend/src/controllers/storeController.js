const { query } = require('../config/db');

/**
 * List all stores for Normal Users / Public View
 * Includes Overall Rating and Logged-in User's Rating (if authenticated)
 */
async function getAllStores(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { name = '', address = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSort = {
      name: 's.name',
      address: 's.address',
      rating: 'overall_rating'
    };

    const sortColumn = allowedSort[sortBy] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        COALESCE(AVG(r.rating), 0) as overall_rating,
        COUNT(r.id) as total_ratings,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [userId || -1];

    if (name.trim()) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }

    if (address.trim()) {
      sql += ` AND s.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    sql += ` GROUP BY s.id, s.name, s.email, s.address`;
    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const [stores] = await query(sql, params);

    const formattedStores = stores.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      overallRating: s.total_ratings > 0 ? parseFloat(s.overall_rating).toFixed(2) : 'No Ratings',
      totalRatings: s.total_ratings,
      userRating: s.user_rating ? parseInt(s.user_rating, 10) : null
    }));

    return res.json({ success: true, count: formattedStores.length, stores: formattedStores });
  } catch (err) {
    console.error('getAllStores error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch stores.', error: err.message });
  }
}

/**
 * Get store details by ID
 */
async function getStoreById(req, res) {
  try {
    const storeId = req.params.id;
    const userId = req.user ? req.user.id : null;

    const [stores] = await query(
      `SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        COALESCE(AVG(r.rating), 0) as overall_rating,
        COUNT(r.id) as total_ratings,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) as user_rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id, s.name, s.email, s.address`,
      [userId || -1, storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const store = stores[0];
    return res.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating: store.total_ratings > 0 ? parseFloat(store.overall_rating).toFixed(2) : 'No Ratings',
        totalRatings: store.total_ratings,
        userRating: store.user_rating ? parseInt(store.user_rating, 10) : null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch store details.', error: err.message });
  }
}

module.exports = {
  getAllStores,
  getStoreById
};
