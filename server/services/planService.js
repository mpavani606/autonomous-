const { knowledgeGraph } = require('../utils/demoData');

const normalize = (value) => String(value || '').trim().toLowerCase();

const findGraphConcept = (topic) => {
  const normalizedTopic = normalize(topic);
  if (!normalizedTopic) return null;
  return knowledgeGraph.nodes.find((node) => {
    if (node.kind !== 'concept') return false;
    const normalizedName = normalize(node.name);
    return normalizedTopic === normalizedName
      || normalizedTopic.includes(normalizedName)
      || normalizedName.includes(normalizedTopic);
  }) || null;
};

const getPrerequisites = (concept, existingKnowledge) => {
  if (!concept) return [];

  const known = normalize(existingKnowledge);
  const visited = new Set();
  const prerequisites = [];

  const visit = (node) => {
    const incomingEdges = knowledgeGraph.edges.filter(
      (edge) => edge.target === node.id && edge.type === 'PREREQUISITE_OF'
    );
    for (const edge of incomingEdges) {
      const prerequisite = knowledgeGraph.nodes.find(
        (candidate) => candidate.kind === 'concept' && candidate.id === edge.source
      );
      if (!prerequisite || visited.has(prerequisite.id)) continue;
      visited.add(prerequisite.id);
      visit(prerequisite);
      if (!known.includes(normalize(prerequisite.name))) {
        prerequisites.push(prerequisite);
      }
    }
  };

  visit(concept);
  return prerequisites;
};

const buildTaskSequence = (goalInput = {}) => {
  const weakArea = goalInput.weakArea;
  const exam = goalInput.exam || 'your goal';
  const focusTopic = weakArea || exam;
  const dailyHours = Number(goalInput.hoursPerDay) || 2;
  const matchedConcept = findGraphConcept(focusTopic);
  const prerequisites = getPrerequisites(matchedConcept, goalInput.existingKnowledge);
  const taskConcept = matchedConcept?.name || focusTopic;
  const tasks = prerequisites.map((prerequisite, index) => ({
    type: 'revision',
    title: `Review ${prerequisite.name} prerequisite`,
    concept: prerequisite.name,
    day: `Day ${index + 1}`,
    estimatedHours: Math.min(dailyHours, Math.max(0.5, dailyHours * 0.35)),
  }));
  const nextDay = tasks.length + 1;

  tasks.push(
    {
      type: 'practice',
      title: `${taskConcept} guided practice`,
      concept: taskConcept,
      day: `Day ${nextDay}`,
      estimatedHours: Math.min(dailyHours, Math.max(0.5, dailyHours * 0.6)),
    },
    {
      type: 'assessment',
      title: `${taskConcept} knowledge check`,
      concept: taskConcept,
      day: `Day ${nextDay + 1}`,
      estimatedHours: Math.min(dailyHours, Math.max(0.5, dailyHours * 0.3)),
    },
    {
      type: 'mock-test',
      title: `Apply learning to ${exam}`,
      concept: exam,
      day: `Day ${nextDay + 3}`,
      estimatedHours: Math.min(dailyHours, Math.max(0.5, dailyHours * 0.8)),
    }
  );
  return { tasks, matchedConcept, prerequisites };
};

const generateTaskSequence = (goalInput = {}) => buildTaskSequence(goalInput).tasks;

const buildPlan = (goalInput = {}) => {
  const normalizedGoal = {
    title: goalInput.title || 'Learn a new skill',
    exam: goalInput.exam || 'your goal',
    hoursPerDay: Number(goalInput.hoursPerDay) || 2,
    skillLevel: goalInput.skillLevel || 'Beginner',
    preferredStudyTime: goalInput.preferredStudyTime || 'Flexible',
    learningStyle: goalInput.learningStyle || 'Mixed approach',
    ...goalInput,
  };
  const focusTopic = normalizedGoal.weakArea || normalizedGoal.exam;
  const { tasks, matchedConcept, prerequisites } = buildTaskSequence(normalizedGoal);
  const adaptiveReasoning = goalInput.weakArea
    ? [`${goalInput.weakArea} is a learner-reported focus area, not an assessed skill gap.`]
    : [`No self-reported focus area or assessment result was provided; ${normalizedGoal.exam} is used as the initial planning context.`];

  if (normalizedGoal.existingKnowledge) {
    adaptiveReasoning.push('Learner-reported prior knowledge is used to avoid proposing prerequisite reviews for concepts the learner says they already know.');
  }
  if (matchedConcept) {
    adaptiveReasoning.push(`The focus matches ${matchedConcept.name} in the demo knowledge graph; prerequisite links were used to order the proposed actions.`);
    if (!prerequisites.length) {
      adaptiveReasoning.push(`No unreported prerequisite concepts were found before ${matchedConcept.name} in the available graph context.`);
    }
  } else {
    adaptiveReasoning.push(`No direct concept match for "${focusTopic}" exists in the demo knowledge graph, so the plan uses a general review-practice-check sequence.`);
  }

  return {
    goal: normalizedGoal.title,
    exam: normalizedGoal.exam,
    timeline: normalizedGoal.targetDate ? `Target date: ${normalizedGoal.targetDate}` : 'No target date set',
    milestones: [
      `${normalizedGoal.skillLevel} foundations`,
      `${normalizedGoal.exam} concept practice`,
      `Apply learning to ${normalizedGoal.title}`,
      'Review learner feedback before the next planning cycle',
    ],
    tasks,
    knowledgeGraph: {
      nodes: matchedConcept ? [...prerequisites, matchedConcept] : [],
      edges: matchedConcept
        ? knowledgeGraph.edges.filter((edge) => {
          const includedIds = new Set([...prerequisites, matchedConcept].map((node) => node.id));
          return includedIds.has(edge.source) && includedIds.has(edge.target);
        })
        : [],
    },
    adaptiveReasoning,
    missionContext: {
      focusTopic,
      hoursPerDay: normalizedGoal.hoursPerDay,
      preferredStudyTime: normalizedGoal.preferredStudyTime,
      learningStyle: normalizedGoal.learningStyle,
      existingKnowledge: normalizedGoal.existingKnowledge || '',
    },
  };
};

const buildAdaptivePlan = (goalInput, { concept, score, previousScore = null }) => {
  const plan = buildPlan({ ...goalInput, weakArea: concept });
  const matchedConcept = findGraphConcept(concept);
  const scoreChange = previousScore === null ? null : score - previousScore;
  const declining = scoreChange !== null && scoreChange <= -10;
  const needsMoreSupport = score < 60 || declining;
  const hoursPerDay = Number(goalInput.hoursPerDay) || 2;
  const focusedTask = (type, title, day, portion) => ({
    type,
    title,
    concept: matchedConcept?.name || concept,
    day,
    estimatedHours: Math.min(hoursPerDay, Math.max(0.5, hoursPerDay * portion)),
  });

  if (needsMoreSupport) {
    plan.tasks = [
      focusedTask('revision', `Review ${concept} fundamentals`, 'Next session', 0.3),
      focusedTask('practice', `Complete focused ${concept} practice`, 'Following session', 0.5),
      focusedTask('assessment', `Check understanding of ${concept}`, 'After practice', 0.25),
      ...plan.tasks.filter((task) => task.type !== 'mock-test'),
    ];
    plan.adaptiveReasoning.unshift(
      declining
        ? `Your learner-reported ${concept} score moved from ${previousScore}% to ${score}% (a ${Math.abs(scoreChange)}-point decrease). The agent suggests extra review and focused practice before a broader test.`
        : `Your learner-reported ${concept} score was ${score}%. The agent suggests extra review and focused practice before a broader test.`
    );
  } else if (score >= 80) {
    const nextConcept = matchedConcept && knowledgeGraph.edges
      .filter((edge) => edge.type === 'PREREQUISITE_OF' && edge.source === matchedConcept.id)
      .map((edge) => knowledgeGraph.nodes.find((node) => node.kind === 'concept' && node.id === edge.target))
      .find(Boolean);
    if (nextConcept) {
      plan.tasks = [
        focusedTask('revision', `Briefly review ${concept}`, 'Next session', 0.2),
        {
          type: 'practice',
          title: `Explore ${nextConcept.name}`,
          concept: nextConcept.name,
          day: 'Following session',
          estimatedHours: Math.min(hoursPerDay, Math.max(0.5, hoursPerDay * 0.5)),
        },
        ...plan.tasks.filter((task) => task.concept !== concept),
      ];
      plan.adaptiveReasoning.unshift(
        `Your learner-reported ${concept} score was ${score}%. The agent suggests a brief review, then introduces the linked next concept, ${nextConcept.name}.`
      );
    } else {
      plan.tasks = [
        focusedTask('revision', `Briefly review ${concept}`, 'Next session', 0.25),
        focusedTask('assessment', `Try a more challenging ${concept} check`, 'Following session', 0.4),
        ...plan.tasks.filter((task) => task.concept !== concept),
      ];
      plan.adaptiveReasoning.unshift(
        `Your learner-reported ${concept} score was ${score}%. The agent suggests a more challenging check; no next concept is linked in the available graph.`
      );
    }
  } else {
    plan.tasks = [
      focusedTask('revision', `Reinforce ${concept}`, 'Next session', 0.25),
      focusedTask('assessment', `Check ${concept} understanding again`, 'Following session', 0.3),
      ...plan.tasks.filter((task) => task.concept !== concept),
    ];
    plan.adaptiveReasoning.unshift(
      `Your learner-reported ${concept} score was ${score}%. The agent suggests a short reinforcement review and another knowledge check.`
    );
  }

  plan.feedbackSignal = {
    concept: matchedConcept?.name || concept,
    score,
    previousScore,
    change: scoreChange,
    source: 'learner-reported',
  };
  return plan;
};

module.exports = {
  buildPlan,
  buildAdaptivePlan,
  generateTaskSequence,
};
