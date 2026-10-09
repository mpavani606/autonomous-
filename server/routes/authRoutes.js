const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const authenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/register', authenticationLimiter, registerUser);
router.post('/login', authenticationLimiter, loginUser);
router.get('/me', protect, getProfile);

module.exports = router;
