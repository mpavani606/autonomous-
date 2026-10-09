const mongoose = require('mongoose');
const { Goal, StudyPlan, StudyTask, User } = require('../models');

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Learner data storage is unavailable. Please try again when MongoDB is connected.');
    error.statusCode = 503;
    throw error;
  }
};

const persistPlan = async ({ userId, goalInput, plan, summary, goalId = null }) => {
  requireDatabase();

  let createdGoal;
  let createdPlan;
  try {
    const resolvedGoalId = goalId || (createdGoal = await Goal.create({
      user: userId,
      title: goalInput.title,
      exam: goalInput.exam,
      availableHoursPerDay: goalInput.hoursPerDay,
      weakArea: goalInput.weakArea,
      skillLevel: goalInput.skillLevel,
      targetDate: goalInput.targetDate || undefined,
      learningStyle: goalInput.learningStyle,
      existingKnowledge: goalInput.existingKnowledge,
      summary,
    }))._id;

    createdPlan = await StudyPlan.create({
      user: userId,
      goalId: resolvedGoalId,
      title: plan.goal,
      summary: summary || plan.adaptiveReasoning?.join(' '),
      milestones: plan.milestones || [],
      adaptiveReasoning: plan.adaptiveReasoning || [],
      exam: goalInput.exam,
      hoursPerDay: goalInput.hoursPerDay,
      weakArea: goalInput.weakArea,
      skillLevel: goalInput.skillLevel,
      preferredStudyTime: goalInput.preferredStudyTime,
      targetDate: goalInput.targetDate,
      existingKnowledge: goalInput.existingKnowledge,
      learningStyle: goalInput.learningStyle,
      timeline: plan.timeline,
      missionContext: plan.missionContext,
      knowledgeGraph: plan.knowledgeGraph,
      status: 'active',
    });

    const savedTasks = await StudyTask.insertMany(
      (plan.tasks || []).map((task) => ({
        user: userId,
        plan: createdPlan._id,
        title: task.title,
        description: task.description || '',
        type: task.type || 'practice',
        concept: task.concept || '',
        day: task.day || '',
        dueDate: task.dueDate || undefined,
        estimatedHours: task.estimatedHours || 1,
      }))
    );
    createdPlan.tasks = savedTasks.map((task) => task._id);
    await createdPlan.save();

    const userUpdate = {
      goalSummary: goalInput.title,
      skillLevel: goalInput.skillLevel,
      hoursPerDay: goalInput.hoursPerDay,
      preferredStudyTime: goalInput.preferredStudyTime,
      learningStyle: goalInput.learningStyle,
      onboardingCompleted: true,
      targetCompletionDate: goalInput.targetDate ? new Date(goalInput.targetDate) : null,
    };
    const profileUpdate = await User.updateOne({ _id: userId }, { $set: userUpdate });
    if (!profileUpdate.matchedCount) {
      const error = new Error('The learner account for this session no longer exists.');
      error.statusCode = 401;
      throw error;
    }

    await StudyPlan.updateMany(
      { user: userId, _id: { $ne: createdPlan._id }, status: 'active' },
      { $set: { status: 'paused' } }
    );

    return {
      ...plan,
      goal: goalInput.title,
      exam: goalInput.exam,
      hoursPerDay: goalInput.hoursPerDay,
      weakArea: goalInput.weakArea,
      skillLevel: goalInput.skillLevel,
      preferredStudyTime: goalInput.preferredStudyTime,
      targetDate: goalInput.targetDate,
      existingKnowledge: goalInput.existingKnowledge,
      learningStyle: goalInput.learningStyle,
      summary: createdPlan.summary,
      id: String(createdPlan._id),
      goalId: String(resolvedGoalId),
      tasks: savedTasks.map((task) => ({
        id: String(task._id),
        title: task.title,
        description: task.description,
        type: task.type,
        concept: task.concept,
        day: task.day,
        estimatedHours: task.estimatedHours,
        status: task.status,
      })),
    };
  } catch (error) {
    if (createdPlan) {
      await StudyTask.deleteMany({ plan: createdPlan._id }).catch((cleanupError) => {
        console.error('Could not clean up study tasks after plan persistence failed.', cleanupError);
      });
      await StudyPlan.deleteOne({ _id: createdPlan._id }).catch((cleanupError) => {
        console.error('Could not clean up a study plan after persistence failed.', cleanupError);
      });
    }
    if (createdGoal) {
      await Goal.deleteOne({ _id: createdGoal._id }).catch((cleanupError) => {
        console.error('Could not clean up a goal after plan persistence failed.', cleanupError);
      });
    }
    throw error;
  }
};

const serializePlan = (document) => {
  const plan = document.toObject ? document.toObject() : document;
  return {
    ...plan,
    id: String(plan._id || plan.id),
    goal: plan.title,
    goalId: plan.goalId ? String(plan.goalId) : undefined,
    tasks: (plan.tasks || []).map((task) => ({
      id: String(task._id || task.id),
      title: task.title,
      description: task.description,
      type: task.type,
      concept: task.concept,
      day: task.day,
      estimatedHours: task.estimatedHours,
      status: task.status,
    })),
  };
};

module.exports = { persistPlan, requireDatabase, serializePlan };
