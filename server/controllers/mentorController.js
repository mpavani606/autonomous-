const { generateMentorReply } = require('../services/aiService');

const textField = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const buildMentorContext = (value = {}) => {
  const safeValue = value && typeof value === 'object' ? value : {};
  const mission = safeValue.mission && typeof safeValue.mission === 'object' ? safeValue.mission : {};
  const graphConcepts = Array.isArray(safeValue.graphConcepts) ? safeValue.graphConcepts : [];
  const nextActions = Array.isArray(safeValue.nextActions) ? safeValue.nextActions : [];
  const noteConcepts = Array.isArray(safeValue.noteConcepts) ? safeValue.noteConcepts : [];

  return {
    mission: {
      goal: textField(mission.goal, 160),
      exam: textField(mission.exam, 100),
      hoursPerDay: Number.isFinite(Number(mission.hoursPerDay)) ? Math.min(16, Math.max(0, Number(mission.hoursPerDay))) : null,
      skillLevel: textField(mission.skillLevel, 40),
      weakArea: textField(mission.weakArea, 100),
      existingKnowledge: textField(mission.existingKnowledge, 1000),
      learningStyle: textField(mission.learningStyle, 80),
    },
    nextActions: nextActions.slice(0, 5).map((task) => ({
      title: textField(task?.title, 120),
      concept: textField(task?.concept, 100),
      type: textField(task?.type, 40),
      day: textField(task?.day, 40),
      estimatedHours: Number.isFinite(Number(task?.estimatedHours)) ? Math.min(16, Math.max(0, Number(task.estimatedHours))) : null,
    })).filter((task) => task.title),
    graphConcepts: graphConcepts.slice(0, 20).map((concept) => ({
      name: textField(concept?.name, 80),
      masteryScore: Number.isFinite(Number(concept?.masteryScore)) ? Math.min(100, Math.max(0, Number(concept.masteryScore))) : null,
    })).filter((concept) => concept.name),
    noteConcepts: noteConcepts.slice(0, 20).map((concept) => textField(concept, 80)).filter(Boolean),
  };
};

const askMentor = async (req, res, next) => {
  try {
    const { question, context } = req.body || {};
    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'Enter a question for the AI mentor.' });
    }
    if (question.trim().length > 2000) {
      return res.status(400).json({ message: 'Questions must be 2,000 characters or fewer.' });
    }

    const result = await generateMentorReply(question.trim(), buildMentorContext(context));

    return res.json({ success: true, data: { question: question.trim(), ...result } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { askMentor };
