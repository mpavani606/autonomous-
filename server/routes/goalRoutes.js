const express = require('express');
const { analyzeGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/analyze', protect, analyzeGoal);

module.exports = router;
