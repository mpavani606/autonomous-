const mongoose = require('mongoose');
const { Assessment, Goal, Progress, StudyPlan } = require('../models');
const { analytics } = require('../utils/demoData');
const { buildAdaptivePlan } = require('../services/planService');
const { persistPlan, requireDatabase } = require('../services/persistenceService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getProgress = async (req, res, next) => {
  try {
    requireDatabase();
    const assessments = await Assessment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (assessments.length) {
      const latestScores = await Assessment.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: { $toLower: '$concept' },
            name: { $first: '$concept' },
            value: { $first: '$score' },
          },
        },
      ]);
      const priorScores = new Map();
      const recentAssessments = [...assessments].reverse().map((assessment) => {
        const key = assessment.concept.trim().toLowerCase();
        const previousScore = priorScores.has(key) ? priorScores.get(key) : null;
        priorScores.set(key, assessment.score);
        return {
          concept: assessment.concept,
          score: assessment.score,
          previousScore,
          recordedAt: assessment.createdAt,
        };
      }).reverse();
      return res.json({
        success: true,
        data: {
          overallMastery: null,
          averageReportedScore: Math.round(
            latestScores.reduce((total, item) => total + item.score, 0) / latestScores.length
          ),
          accuracy: null,
          streak: null,
          studyHours: null,
          completionRate: null,
          topicBreakdown: latestScores.map((item) => ({
            name: item.name,
            value: item.value,
          })),
          recentAssessments,
          source: 'learner-reported',
        },
      });
    }

    const progress = await Progress.findOne({ user: req.user.id }).lean();
    if (progress) {
      return res.json({
        success: true,
        data: {
          overallMastery: progress.overallMastery,
          accuracy: progress.quizAccuracy,
          streak: progress.streak,
          studyHours: progress.studyHours,
          completionRate: progress.completionRate,
          topicBreakdown: [],
          recentAssessments: [],
          source: 'learner-records',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        ...analytics,
        source: 'representative-demo',
      },
    });
  } catch (error) {
    return next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  let savedAssessment;
  try {
    const payload = req.body || {};
    if (typeof payload.concept !== 'string' || !payload.concept.trim() || payload.concept.trim().length > 100) {
      return res.status(400).json({ message: 'Select a concept of 100 characters or fewer.' });
    }
    if (!Number.isInteger(payload.score) || payload.score < 0 || payload.score > 100) {
      return res.status(400).json({ message: 'Score must be a whole number between 0 and 100.' });
    }

    requireDatabase();
    const activePlan = await StudyPlan.findOne({ user: req.user.id, status: 'active' })
      .sort({ createdAt: -1 })
      .lean();
    if (!activePlan) {
      return res.status(409).json({ message: 'Create a mission before submitting practice feedback.' });
    }

    const concept = payload.concept.trim();
    const previous = await Assessment.findOne({
      user: req.user.id,
      concept: { $regex: `^${escapeRegex(concept)}$`, $options: 'i' },
    }).sort({ createdAt: -1 }).lean();

    const goal = activePlan.goalId
      ? await Goal.findOne({ _id: activePlan.goalId, user: req.user.id }).lean()
      : null;
    const goalInput = {
      title: activePlan.title,
      exam: activePlan.exam || goal?.exam || 'Learning goal',
      hoursPerDay: activePlan.hoursPerDay || goal?.availableHoursPerDay || 2,
      weakArea: concept,
      skillLevel: activePlan.skillLevel || goal?.skillLevel || 'Beginner',
      preferredStudyTime: activePlan.preferredStudyTime || 'Flexible',
      targetDate: activePlan.targetDate || '',
      existingKnowledge: activePlan.existingKnowledge || goal?.existingKnowledge || '',
      learningStyle: activePlan.learningStyle || goal?.learningStyle || 'Mixed approach',
    };
    const plan = buildAdaptivePlan(goalInput, {
      concept,
      score: payload.score,
      previousScore: previous ? previous.score : null,
    });

    savedAssessment = await Assessment.create({
      user: req.user.id,
      concept,
      score: payload.score,
      summary: 'Learner-reported practice score; not independently verified.',
    });
    const persistedPlan = await persistPlan({
      userId: req.user.id,
      goalInput,
      plan,
      summary: plan.adaptiveReasoning.join(' '),
      goalId: activePlan.goalId,
    });

    return res.json({
      success: true,
      data: {
        plan: persistedPlan,
        previousScore: previous ? previous.score : null,
        assessment: {
          concept,
          score: payload.score,
          previousScore: previous ? previous.score : null,
          recordedAt: savedAssessment.createdAt,
        },
        message: 'Plan recommendations were adjusted using the score you submitted. Review them before deciding what to study.',
      },
    });
  } catch (error) {
    if (savedAssessment) {
      await Assessment.deleteOne({ _id: savedAssessment._id }).catch((cleanupError) => {
        console.error('Could not clean up feedback after plan persistence failed.', cleanupError);
      });
    }
    return next(error);
  }
};

module.exports = { getProgress, submitFeedback };
