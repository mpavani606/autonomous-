const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    skillLevel: { type: String, default: 'Beginner' },
    hoursPerDay: { type: Number, default: 2 },
    preferredStudyTime: { type: String, default: 'Evening' },
    goalSummary: { type: String },
    targetCompletionDate: { type: Date },
    learningStyle: { type: String, default: 'Self-paced' },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    exam: { type: String },
    availableHoursPerDay: { type: Number },
    weakArea: { type: String },
    skillLevel: { type: String },
    targetDate: { type: Date },
    learningStyle: { type: String },
    existingKnowledge: { type: String },
    summary: { type: String },
  },
  { timestamps: true }
);

const conceptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    conceptId: { type: String, required: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    difficulty: { type: String, default: 'beginner' },
    prerequisites: [{ type: String }],
    relatedConcepts: [{ type: String }],
    masteryScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    lastStudied: { type: Date },
    nextRevision: { type: Date },
  },
  { timestamps: true }
);

const knowledgeEdgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, required: true },
    target: { type: String, required: true },
    relationship: {
      type: String,
      enum: ['PREREQUISITE_OF', 'RELATED_TO', 'DEPENDS_ON', 'MASTERED', 'WEAK_IN'],
      required: true,
    },
  },
  { timestamps: true }
);

const studyTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan' },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['revision', 'practice', 'assessment', 'mock-test'], default: 'practice' },
    concept: { type: String },
    day: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
    estimatedHours: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true },
    summary: { type: String },
    milestones: [{ type: String }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyTask' }],
    adaptiveReasoning: [{ type: String }],
    exam: { type: String },
    hoursPerDay: { type: Number },
    weakArea: { type: String },
    skillLevel: { type: String },
    preferredStudyTime: { type: String },
    targetDate: { type: String },
    existingKnowledge: { type: String },
    learningStyle: { type: String },
    timeline: { type: String },
    missionContext: { type: mongoose.Schema.Types.Mixed },
    knowledgeGraph: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  },
  { timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    concepts: [{ type: String }],
    keyPoints: [{ type: String }],
    definitions: [{ term: String, definition: String }],
    flashcards: [{ question: String, answer: String }],
    graphLinks: { type: mongoose.Schema.Types.Mixed },
    missingPrerequisites: [{ concept: String, requiredBy: String }],
    tags: [{ type: String }],
    sourceType: { type: String, enum: ['text', 'pdf', 'upload', 'lecture'], default: 'text' },
  },
  { timestamps: true }
);

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    concept: { type: String },
    mastered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    concept: { type: String },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    overallMastery: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    quizAccuracy: { type: Number, default: 0 },
    weakAreas: [{ type: String }],
    strongAreas: [{ type: String }],
  },
  { timestamps: true }
);

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String },
    scheduledFor: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String },
    category: { type: String, default: 'info' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const aiRecommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, default: 'study' },
    title: { type: String },
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionType: { type: String, enum: ['plan', 'revision', 'practice', 'mock-test'], default: 'practice' },
    durationMinutes: { type: Number },
    notes: { type: String },
    performance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    concept: { type: String },
    score: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    summary: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model('User', userSchema),
  Goal: mongoose.model('Goal', goalSchema),
  Concept: mongoose.model('Concept', conceptSchema),
  KnowledgeEdge: mongoose.model('KnowledgeEdge', knowledgeEdgeSchema),
  StudyTask: mongoose.model('StudyTask', studyTaskSchema),
  StudyPlan: mongoose.model('StudyPlan', studyPlanSchema),
  Note: mongoose.model('Note', noteSchema),
  Flashcard: mongoose.model('Flashcard', flashcardSchema),
  Quiz: mongoose.model('Quiz', quizSchema),
  Progress: mongoose.model('Progress', progressSchema),
  Reminder: mongoose.model('Reminder', reminderSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  AIRecommendation: mongoose.model('AIRecommendation', aiRecommendationSchema),
  StudySession: mongoose.model('StudySession', studySessionSchema),
  Assessment: mongoose.model('Assessment', assessmentSchema),
};
