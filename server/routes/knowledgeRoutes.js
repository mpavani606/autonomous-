const express = require('express');
const { getKnowledgeGraph, getConcepts } = require('../controllers/knowledgeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/graph', protect, getKnowledgeGraph);
router.get('/concepts', protect, getConcepts);

module.exports = router;
