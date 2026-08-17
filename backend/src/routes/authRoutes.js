const express = require('express');
const router = express.Router();
const { login, register, updatePassword, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.put('/update-password', authenticateToken, updatePassword);
router.get('/me', authenticateToken, getProfile);

module.exports = router;
