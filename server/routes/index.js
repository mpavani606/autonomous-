const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const goalRoutes = require('./goalRoutes');
const planRoutes = require('./planRoutes');
const knowledgeRoutes = require('./knowledgeRoutes');
const notesRoutes = require('./notesRoutes');
const mentorRoutes = require('./mentorRoutes');
const progressRoutes = require('./progressRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.json({
    status: databaseConnected ? 'healthy' : 'degraded',
    api: 'running',
    database: databaseConnected ? 'connected' : 'disconnected',
    message: databaseConnected
      ? 'Autonomous Study Planner API and database are available.'
      : 'API is running, but MongoDB-backed features are unavailable.',
  });
});

router.get('/ready', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  if (!databaseConnected) {
    return res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      message: 'MongoDB must be connected before learner data can be read or saved.',
    });
  }

  return res.json({ status: 'ready', database: 'connected' });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/goals', goalRoutes);
router.use('/study-plans', planRoutes);
router.use('/knowledge-graph', knowledgeRoutes);
router.use('/notes', notesRoutes);
router.use('/ai', mentorRoutes);
router.use('/progress', progressRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
