const mongoose = require('mongoose');
const validator = require('validator');
const { Assessment, StudyPlan, StudySession, User } = require('../models');
const { createUserRecord } = require('./authController');

const getAdminStats = async (req, res) => {
  const [totalStudents, totalAdmins, aiPlansGenerated, studySessions, assessmentStats] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'admin' }),
    StudyPlan.countDocuments(),
    StudySession.countDocuments(),
    Assessment.aggregate([
      { $group: { _id: null, averageScore: { $avg: '$score' }, count: { $sum: 1 } } },
    ]),
  ]);

  const assessments = assessmentStats[0] || { averageScore: null, count: 0 };
  res.json({
    success: true,
    data: {
      totalStudents,
      totalAdmins,
      aiPlansGenerated,
      studySessions,
      selfReportedAssessments: assessments.count,
      averageSelfReportedScore: assessments.averageScore === null
        ? null
        : Math.round(assessments.averageScore),
      source: 'live database records',
    },
  });
};

const getAdmins = async (req, res) => {
  const admins = await User.find({ role: 'admin' })
    .select('name email createdAt')
    .sort({ createdAt: 1 })
    .lean();
  res.json({ success: true, data: admins });
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (!validator.isEmail(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Administrator creation is temporarily unavailable.' });
    }

    const user = await createUserRecord({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: 'admin',
    });
    return res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    return next(error);
  }
};

module.exports = { createAdmin, getAdminStats, getAdmins };
