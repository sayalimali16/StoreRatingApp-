const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { validateUserRegistration, validateAddress, validateEmail, validateName } = require('../utils/validation');

/**
 * Admin Dashboard Stats (Total Users, Stores, Ratings)
 */
async function getDashboardStats(req, res) {
  try {
    const [userCounts] = await query('SELECT COUNT(*) as count FROM users');
    const [storeCounts] = await query('SELECT COUNT(*) as count FROM stores');
    const [ratingCounts] = await query('SELECT COUNT(*) as count FROM ratings');
    const [avgRatingRes] = await query('SELECT AVG(rating) as avg_rating FROM ratings');

    return res.json({
      success: true,
      stats: {
        totalUsers: userCounts[0].count,
        totalStores: storeCounts[0].count,
        totalRatings: ratingCounts[0].count,
        overallAverageRating: avgRatingRes[0].avg_rating ? parseFloat(avgRatingRes[0].avg_rating).toFixed(2) : '0.00'
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.', error: err.message });
  }
}

/**
 * View/search/filter/sort Users (Normal Users, Admin Users, Store Owners)
 * Includes store details and average rating if the user is a Store Owner!
 */
async function getUsers(req, res) {
  try {
    const { search = '', role = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const fieldMap = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'r.name',
      created_at: 'u.created_at'
    };

    const sortColumn = fieldMap[sortBy] || 'u.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        r.name as role, 
        u.created_at,
        s.id as store_id,
        s.name as store_name,
        (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as store_avg_rating,
        (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as store_total_ratings
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN stores s ON s.owner_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (search.trim()) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (role.trim()) {
      sql += ` AND r.name = ?`;
      params.push(role.trim());
    }

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const [users] = await query(sql, params);

    // Format output
    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      address: u.address,
      role: u.role,
      createdAt: u.created_at,
      store: u.role === 'STORE_OWNER' && u.store_id ? {
        id: u.store_id,
        name: u.store_name,
        averageRating: u.store_avg_rating ? parseFloat(u.store_avg_rating).toFixed(2) : 'No Ratings',
        totalRatings: u.store_total_ratings || 0
      } : null
    }));

    return res.json({ success: true, count: formattedUsers.length, users: formattedUsers });
  } catch (err) {
    console.error('Admin getUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list.', error: err.message });
  }
}

/**
 * Add User (Normal User, Admin User, or Store Owner) by Admin
 */
async function addUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    // Validate inputs
    const { isValid, errors } = validateUserRegistration({ name, email, password, address });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    // Role validation
    const validRoles = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
    const targetRole = role && validRoles.includes(role) ? role : 'NORMAL_USER';

    const [roleRes] = await query('SELECT id FROM roles WHERE name = ?', [targetRole]);
    if (roleRes.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }
    const roleId = roleRes[0].id;

    // Check duplicate email
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await query(
      'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), roleId]
    );

    return res.status(201).json({
      success: true,
      message: `User created successfully with role ${targetRole}.`,
      userId: result.insertId
    });
  } catch (err) {
    console.error('Admin addUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user.', error: err.message });
  }
}

/**
 * View/search/filter/sort Stores by Admin
 */
async function getStores(req, res) {
  try {
    const { search = '', minRating = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const fieldMap = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'overall_rating',
      created_at: 's.created_at'
    };

    const sortColumn = fieldMap[sortBy] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        u.id as owner_id,
        u.name as owner_name,
        u.email as owner_email,
        COALESCE(AVG(r.rating), 0) as overall_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [];

    if (search.trim()) {
      sql += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.id, u.name, u.email`;

    if (minRating && !isNaN(parseFloat(minRating))) {
      sql += ` HAVING overall_rating >= ?`;
      params.push(parseFloat(minRating));
    }

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const [stores] = await query(sql, params);

    const formattedStores = stores.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      createdAt: s.created_at,
      owner: s.owner_id ? { id: s.owner_id, name: s.owner_name, email: s.owner_email } : null,
      overallRating: s.total_ratings > 0 ? parseFloat(s.overall_rating).toFixed(2) : 'No Ratings',
      totalRatings: s.total_ratings
    }));

    return res.json({ success: true, count: formattedStores.length, stores: formattedStores });
  } catch (err) {
    console.error('Admin getStores error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch stores.', error: err.message });
  }
}

/**
 * Add Store by Admin
 */
async function addStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length < 2 || name.trim().length > 200) {
      return res.status(400).json({ success: false, message: 'Store Name is required (2 to 200 characters).' });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const addrErr = validateAddress(address);
    if (addrErr) return res.status(400).json({ success: false, message: addrErr });

    let finalOwnerId = null;
    if (ownerId) {
      const [ownerRes] = await query('SELECT id, role_id FROM users WHERE id = ?', [ownerId]);
      if (ownerRes.length === 0) {
        return res.status(400).json({ success: false, message: 'Selected owner user does not exist.' });
      }
      finalOwnerId = ownerId;
    }

    const [result] = await query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), finalOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      storeId: result.insertId
    });
  } catch (err) {
    console.error('Admin addStore error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create store.', error: err.message });
  }
}

module.exports = {
  getDashboardStats,
  getUsers,
  addUser,
  getStores,
  addStore
};
