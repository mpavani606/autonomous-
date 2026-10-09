const { buildPlan } = require('../services/planService');
const { StudyPlan } = require('../models');
const { persistPlan, requireDatabase, serializePlan } = require('../services/persistenceService');

const readText = (value, field, maxLength, fallback = '') => {
  if (value === undefined || value === '') return { value: fallback, error: null };
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    return { value: '', error: `${field} must be no more than ${maxLength} characters.` };
  }
  return { value: value.trim(), error: null };
};

const generatePlan = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const fields = {
      goal: readText(payload.goal, 'Goal', 160, 'Learn a new skill'),
      exam: readText(payload.exam, 'Goal domain', 100, typeof payload.goal === 'string' ? payload.goal.trim() || 'your goal' : 'your goal'),
      weakArea: readText(payload.weakArea, 'Focus topic', 100),
      skillLevel: readText(payload.skillLevel, 'Skill level', 40, 'Beginner'),
      preferredStudyTime: readText(payload.preferredStudyTime, 'Preferred study time', 40, 'Flexible'),
      targetDate: readText(payload.targetDate, 'Target date', 10),
      existingKnowledge: readText(payload.existingKnowledge, 'Existing knowledge', 1000),
      learningStyle: readText(payload.learningStyle, 'Learning style', 80, 'Mixed approach'),
    };
    const invalidField = Object.values(fields).find((field) => field.error);
    if (invalidField) {
      return res.status(400).json({ message: invalidField.error });
    }

    const hoursPerDay = payload.hoursPerDay === undefined ? 2 : payload.hoursPerDay;
    if (typeof hoursPerDay !== 'number' || !Number.isFinite(hoursPerDay) || hoursPerDay < 0.5 || hoursPerDay > 16) {
      return res.status(400).json({ message: 'Available study time must be a number between 0.5 and 16 hours per day.' });
    }

    if (fields.targetDate.value) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.targetDate.value)) {
        return res.status(400).json({ message: 'Target date must use the YYYY-MM-DD format.' });
      }
      const targetDate = new Date(fields.targetDate.value);
      if (Number.isNaN(targetDate.getTime()) || targetDate.toISOString().slice(0, 10) !== fields.targetDate.value) {
        return res.status(400).json({ message: 'Target date must be a valid calendar date.' });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        return res.status(400).json({ message: 'Target date cannot be in the past.' });
      }
    }

    const goalInput = {
      title: fields.goal.value,
      exam: fields.exam.value,
      hoursPerDay,
      weakArea: fields.weakArea.value,
      skillLevel: fields.skillLevel.value,
      preferredStudyTime: fields.preferredStudyTime.value,
      targetDate: fields.targetDate.value,
      existingKnowledge: fields.existingKnowledge.value,
      learningStyle: fields.learningStyle.value,
    };
    const plan = buildPlan(goalInput);
    const savedPlan = await persistPlan({
      userId: req.user.id,
      goalInput,
      plan,
    });

    return res.status(201).json({ success: true, data: savedPlan });
  } catch (error) {
    return next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    requireDatabase();
    const plans = await StudyPlan.find({ user: req.user.id, status: 'active' })
      .populate('tasks')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: plans.map(serializePlan) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { generatePlan, getPlans };
