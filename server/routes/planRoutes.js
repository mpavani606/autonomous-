const express = require('express');
const { generatePlan, getPlans } = require('../controllers/planController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getPlans);
router.post('/generate', protect, generatePlan);

module.exports = router;
