const express = require('express');
const { askMentor } = require('../controllers/mentorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/ask', protect, askMentor);

module.exports = router;
