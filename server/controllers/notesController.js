const { summarizeNote } = require('../services/aiService');
const { Note } = require('../models');
const { requireDatabase } = require('../services/persistenceService');

const getNotes = async (req, res, next) => {
  try {
    requireDatabase();
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      data: notes.map((note) => ({ ...note, id: String(note._id) })),
    });
  } catch (error) {
    return next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const payload = req.body || {};
    if (typeof payload.title !== 'string' || !payload.title.trim()) {
      return res.status(400).json({ message: 'A note title is required.' });
    }
    if (typeof payload.content !== 'string' || !payload.content.trim()) {
      return res.status(400).json({ message: 'Note content is required.' });
    }
    if (payload.title.trim().length > 120) {
      return res.status(400).json({ message: 'Note title must be 120 characters or fewer.' });
    }
    if (payload.content.trim().length > 12000) {
      return res.status(400).json({ message: 'Note content must be 12,000 characters or fewer.' });
    }

    requireDatabase();
    const noteText = payload.content.trim();
    const analysis = await summarizeNote(noteText);
    const note = await Note.create({
      user: req.user.id,
      title: payload.title.trim(),
      content: noteText,
      summary: analysis.summary,
      concepts: analysis.concepts,
      keyPoints: analysis.keyPoints,
      definitions: analysis.definitions,
      flashcards: analysis.flashcards,
      graphLinks: analysis.graphLinks,
      missingPrerequisites: analysis.missingPrerequisites,
      sourceType: 'text',
    });

    return res.status(201).json({
      success: true,
      data: {
        ...note.toObject(),
        id: String(note._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote };
