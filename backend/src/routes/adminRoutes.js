const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, addUser, getStores, addStore } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + SYSTEM_ADMIN role
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', addUser);
router.get('/stores', getStores);
router.post('/stores', addStore);

module.exports = router;
