const { orchestrate } = require('../agents/agentOrchestrator');
const { persistPlan, requireDatabase } = require('../services/persistenceService');

const optionalText = (value, field, maxLength) => {
  if (value === undefined || value === '') return { value: '', error: null };
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    return { value: '', error: `${field} must be no more than ${maxLength} characters.` };
  }
  return { value: value.trim(), error: null };
};

const analyzeGoal = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const goal = optionalText(payload.goal, 'Goal', 160);
    const exam = optionalText(payload.exam, 'Goal domain', 100);
    const skillLevel = optionalText(payload.skillLevel, 'Skill level', 40);
    const preferredStudyTime = optionalText(payload.preferredStudyTime, 'Preferred study time', 40);
    const learningStyle = optionalText(payload.learningStyle, 'Learning style', 80);
    const weakArea = optionalText(payload.weakArea, 'Focus topic', 100);
    const existingKnowledge = optionalText(payload.existingKnowledge, 'Existing knowledge', 1000);
    const invalidText = [goal, exam, skillLevel, preferredStudyTime, learningStyle, weakArea, existingKnowledge]
      .find((field) => field.error);

    if (invalidText) {
      return res.status(400).json({ message: invalidText.error });
    }
    if (!goal.value || !exam.value || !skillLevel.value || !preferredStudyTime.value || !learningStyle.value) {
      return res.status(400).json({ message: 'Goal, domain, skill level, study time and learning approach are required.' });
    }

    const hoursPerDay = Number(payload.hoursPerDay);
    if (!Number.isFinite(hoursPerDay) || hoursPerDay < 0.5 || hoursPerDay > 16) {
      return res.status(400).json({ message: 'Available study time must be between 0.5 and 16 hours per day.' });
    }

    let targetDate;
    if (payload.targetDate) {
      if (typeof payload.targetDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.targetDate)) {
        return res.status(400).json({ message: 'Target date must use the YYYY-MM-DD format.' });
      }
      targetDate = new Date(payload.targetDate);
      if (Number.isNaN(targetDate.getTime()) || targetDate.toISOString().slice(0, 10) !== payload.targetDate) {
        return res.status(400).json({ message: 'Target date must be a valid calendar date.' });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        return res.status(400).json({ message: 'Target date cannot be in the past.' });
      }
    }

    const mission = {
      title: goal.value,
      exam: exam.value,
      hoursPerDay,
      weakArea: weakArea.value,
      skillLevel: skillLevel.value,
      preferredStudyTime: preferredStudyTime.value,
      targetDate: payload.targetDate || '',
      existingKnowledge: existingKnowledge.value,
      learningStyle: learningStyle.value,
    };
    requireDatabase();
    const result = await orchestrate({ goal: mission });
    result.result = await persistPlan({
      userId: req.user.id,
      goalInput: mission,
      plan: result.result,
      summary: result.summary,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports = { analyzeGoal };
