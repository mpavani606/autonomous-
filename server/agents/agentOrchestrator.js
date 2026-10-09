const { generateStudyPlan, generateMentorReply } = require('../services/aiService');
const { buildPlan } = require('../services/planService');

const orchestrate = async ({ goal, question, context = {} }) => {
  if (question) {
    const answer = await generateMentorReply(question, context);
    return {
      agent: 'AI Mentor Agent',
      type: 'mentor',
      response: answer,
    };
  }

  const plan = await generateStudyPlan({
    title: goal.title,
    exam: goal.exam,
    hoursPerDay: goal.hoursPerDay,
    weakArea: goal.weakArea,
    skillLevel: goal.skillLevel,
    preferredStudyTime: goal.preferredStudyTime,
    targetDate: goal.targetDate,
    existingKnowledge: goal.existingKnowledge,
    learningStyle: goal.learningStyle,
  });

  return {
    agent: 'Study Planning Agent',
    type: 'plan',
    result: buildPlan(goal),
    summary: plan.summary,
  };
};

module.exports = { orchestrate };
