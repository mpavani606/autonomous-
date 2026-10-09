const demoUser = {
  id: 'demo-user',
  name: 'Janaki',
  email: 'janaki@student.ai',
  role: 'student',
  skillLevel: 'Intermediate',
  hoursPerDay: 3,
  preferredStudyTime: 'Evening',
  learningStyle: 'Visual + Practice',
  targetCompletionDate: '2026-12-31',
  onboardingCompleted: true,
  goals: ['Crack GATE in 6 months'],
};

const dashboardStats = {
  overallProgress: 72,
  studyStreak: 14,
  studyHours: 31,
  topicsMastered: 18,
  todaysPlan: [
    { title: 'MongoDB basics', time: '09:00', type: 'Concept', status: 'in-progress' },
    { title: 'Practice CRUD patterns', time: '11:00', type: 'Practice', status: 'scheduled' },
    { title: 'React Hooks revision', time: '16:00', type: 'Revision', status: 'scheduled' },
  ],
  weakAreas: ['MongoDB', 'Advanced SQL', 'System Design'],
  strongAreas: ['JavaScript', 'React', 'Node.js'],
  recommendations: [
    'Add one revision session tomorrow to strengthen MongoDB prerequisites.',
    'Reduce the next advanced Node.js task by 20% to improve accuracy.',
    'Schedule one mock test on asynchronous patterns next week.',
  ],
  weeklyHours: [6, 5, 7, 9, 6, 8, 4],
  mastery: [
    { subject: 'JavaScript', value: 90 },
    { subject: 'React', value: 84 },
    { subject: 'Node.js', value: 72 },
    { subject: 'MongoDB', value: 54 },
  ],
  quizAccuracy: [78, 81, 76, 88, 72, 84],
  completionRate: [85, 88, 80, 92, 86, 90],
  streak: [5, 8, 7, 9, 14, 12],
};

const knowledgeGraph = {
  nodes: [
    { id: 'demo-learner', kind: 'learner', name: 'Demo learner', subject: 'Learner status' },
    { id: 'javascript', conceptId: 'javascript', kind: 'concept', name: 'JavaScript', subject: 'Core Programming', difficulty: 'beginner', prerequisites: [], relatedConcepts: ['react'], mastery: 90, masteryScore: 90, confidenceScore: 88, lastStudied: '2026-10-01', nextRevision: '2026-10-15' },
    { id: 'functions', conceptId: 'functions', kind: 'concept', name: 'Functions', subject: 'JavaScript', difficulty: 'beginner', prerequisites: ['javascript'], relatedConcepts: ['callbacks'], mastery: 85, masteryScore: 85, confidenceScore: 82, lastStudied: '2026-09-29', nextRevision: '2026-10-13' },
    { id: 'callbacks', conceptId: 'callbacks', kind: 'concept', name: 'Callbacks', subject: 'JavaScript', difficulty: 'intermediate', prerequisites: ['functions'], relatedConcepts: ['promises'], mastery: 72, masteryScore: 72, confidenceScore: 70, lastStudied: '2026-09-27', nextRevision: '2026-10-10' },
    { id: 'promises', conceptId: 'promises', kind: 'concept', name: 'Promises', subject: 'JavaScript', difficulty: 'intermediate', prerequisites: ['callbacks'], relatedConcepts: ['async-await'], mastery: 74, masteryScore: 74, confidenceScore: 71, lastStudied: '2026-09-25', nextRevision: '2026-10-09' },
    { id: 'async-await', conceptId: 'async-await', kind: 'concept', name: 'Async/Await', subject: 'JavaScript', difficulty: 'intermediate', prerequisites: ['promises'], relatedConcepts: ['promises'], mastery: 69, masteryScore: 69, confidenceScore: 65, lastStudied: '2026-09-22', nextRevision: '2026-10-08' },
    { id: 'react', conceptId: 'react', kind: 'concept', name: 'React', subject: 'Frontend', difficulty: 'intermediate', prerequisites: [], relatedConcepts: ['javascript'], mastery: 84, masteryScore: 84, confidenceScore: 80, lastStudied: '2026-09-30', nextRevision: '2026-10-14' },
    { id: 'hooks', conceptId: 'hooks', kind: 'concept', name: 'React Hooks', subject: 'React', difficulty: 'intermediate', prerequisites: ['react'], relatedConcepts: [], mastery: 80, masteryScore: 80, confidenceScore: 78, lastStudied: '2026-09-26', nextRevision: '2026-10-12' },
    { id: 'mongodb', conceptId: 'mongodb', kind: 'concept', name: 'MongoDB', subject: 'Database', difficulty: 'intermediate', prerequisites: [], relatedConcepts: ['crud'], mastery: 54, masteryScore: 54, confidenceScore: 49, lastStudied: '2026-09-20', nextRevision: '2026-10-08' },
    { id: 'crud', conceptId: 'crud', kind: 'concept', name: 'CRUD', subject: 'MongoDB', difficulty: 'intermediate', prerequisites: ['mongodb'], relatedConcepts: ['queries'], mastery: 62, masteryScore: 62, confidenceScore: 58, lastStudied: '2026-09-21', nextRevision: '2026-10-09' },
    { id: 'queries', conceptId: 'queries', kind: 'concept', name: 'Queries', subject: 'MongoDB', difficulty: 'advanced', prerequisites: ['crud'], relatedConcepts: [], mastery: 57, masteryScore: 57, confidenceScore: 52, lastStudied: '2026-09-18', nextRevision: '2026-10-07' },
  ],
  edges: [
    { source: 'javascript', target: 'functions', type: 'PREREQUISITE_OF' },
    { source: 'functions', target: 'callbacks', type: 'PREREQUISITE_OF' },
    { source: 'callbacks', target: 'promises', type: 'PREREQUISITE_OF' },
    { source: 'promises', target: 'async-await', type: 'PREREQUISITE_OF' },
    { source: 'javascript', target: 'react', type: 'RELATED_TO' },
    { source: 'react', target: 'hooks', type: 'PREREQUISITE_OF' },
    { source: 'hooks', target: 'react', type: 'DEPENDS_ON' },
    { source: 'mongodb', target: 'crud', type: 'PREREQUISITE_OF' },
    { source: 'crud', target: 'queries', type: 'PREREQUISITE_OF' },
    { source: 'javascript', target: 'demo-learner', type: 'MASTERED' },
    { source: 'demo-learner', target: 'mongodb', type: 'WEAK_IN' },
  ],
};

const studyPlan = {
  goal: 'Crack GATE in 6 months',
  milestones: [
    { id: 'm1', title: 'Core foundations', targetWeeks: 2 },
    { id: 'm2', title: 'JavaScript and React depth', targetWeeks: 4 },
    { id: 'm3', title: 'Backend and DB mastery', targetWeeks: 4 },
    { id: 'm4', title: 'Mock tests and revisions', targetWeeks: 3 },
  ],
  tasks: [
    { id: 't1', type: 'revision', title: 'MongoDB basics', concept: 'MongoDB', day: 'Day 1', duration: 45 },
    { id: 't2', type: 'practice', title: 'CRUD practice set', concept: 'CRUD', day: 'Day 2', duration: 60 },
    { id: 't3', type: 'assessment', title: 'Queries quiz', concept: 'Queries', day: 'Day 3', duration: 40 },
    { id: 't4', type: 'revision', title: 'Async/Await refresher', concept: 'Async/Await', day: 'Day 4', duration: 50 },
  ],
  adaptiveReasoning: [
    'MongoDB accuracy dropped from 62% to 48%. The AI added one additional revision block and reduced overload from advanced tasks.',
    'React Hooks performance remains strong. The AI preserved the next practice block and increased conceptual revision instead.',
  ],
};

const notes = [
  {
    id: 'note-1',
    title: 'Promises and Async flows',
    summary: 'Promises help manage async operations and improve readable control flow.',
    concepts: ['JavaScript', 'Promises', 'Async/Await'],
    keyPoints: [
      'Promises help manage asynchronous operations.',
      'Async/Await builds on Promises to make asynchronous code easier to read.',
    ],
    definitions: [
      { term: 'Promise', definition: 'An object representing the eventual completion or failure of an asynchronous operation.' },
    ],
    flashcards: [
      { question: 'What is a Promise?', answer: 'An object representing eventual completion or failure of an async task.' },
    ],
    graphLinks: {
      nodes: [
        { id: 'promises', conceptId: 'promises', name: 'Promises', subject: 'JavaScript' },
        { id: 'async-await', conceptId: 'async-await', name: 'Async/Await', subject: 'JavaScript' },
      ],
      edges: [{ source: 'promises', target: 'async-await', type: 'PREREQUISITE_OF' }],
    },
    missingPrerequisites: [
      { concept: 'Callbacks', requiredBy: 'Promises' },
    ],
  },
];

const analytics = {
  overallMastery: 76,
  completionRate: 88,
  accuracy: 82,
  studyHours: 31,
  streak: 14,
  topicBreakdown: [
    { name: 'JavaScript', value: 90 },
    { name: 'React', value: 85 },
    { name: 'Node.js', value: 72 },
    { name: 'MongoDB', value: 54 },
  ],
};

const adminStats = {
  totalStudents: 1284,
  activeStudents: 942,
  studySessions: 4860,
  mostDifficultConcepts: ['MongoDB Queries', 'System Design', 'Asynchronous Control Flow'],
  weakAreas: ['MongoDB', 'SQL', 'Complex State Management'],
  aiPlansGenerated: 3150,
  quizPerformance: 82,
  systemActivity: 92,
};

module.exports = {
  demoUser,
  dashboardStats,
  knowledgeGraph,
  studyPlan,
  notes,
  analytics,
  adminStats,
};
