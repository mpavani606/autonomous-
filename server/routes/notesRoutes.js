const express = require('express');
const { getNotes, createNote } = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getNotes);
router.post('/', protect, createNote);

module.exports = router;
