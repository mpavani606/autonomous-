const express = require('express');
const { getProgress, submitFeedback } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getProgress);
router.post('/feedback', protect, submitFeedback);

module.exports = router;
