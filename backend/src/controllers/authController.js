const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { validateUserRegistration, validatePassword } = require('../utils/validation');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Single Login Endpoint for all roles (System Admin, Normal User, Store Owner)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Fetch user and joined role name
    const [users] = await query(
      `SELECT u.id, u.name, u.email, u.password, u.address, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
}

/**
 * Normal User Registration Endpoint
 */
async function register(req, res) {
  try {
    const { name, email, password, address } = req.body;

    // Validate inputs
    const { isValid, errors } = validateUserRegistration({ name, email, password, address });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct input errors.',
        errors
      });
    }

    // Check if email already exists
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered. Please use a different email address.'
      });
    }

    // Get Normal User role ID (role_id = 2)
    const [roles] = await query('SELECT id FROM roles WHERE name = ?', ['NORMAL_USER']);
    const roleId = roles.length > 0 ? roles[0].id : 2;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await query(
      'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), roleId]
    );

    const userId = result.insertId;

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'NORMAL_USER'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: 'NORMAL_USER'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
}

/**
 * Update Password Endpoint for Logged-in Users
 */
async function updatePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current password and new password are required.' });
    }

    // Validate new password rules
    const passErr = validatePassword(newPassword);
    if (passErr) {
      return res.status(400).json({ success: false, message: passErr });
    }

    // Fetch user current password
    const [users] = await query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password provided is incorrect.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedNew, userId]);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating password.', error: err.message });
  }
}

/**
 * Get current user profile details
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const [users] = await query(
      `SELECT u.id, u.name, u.email, u.address, r.name as role, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: users[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.', error: err.message });
  }
}

module.exports = {
  login,
  register,
  updatePassword,
  getProfile
};
