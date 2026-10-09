const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const { JWT_SECRET } = require('../config/env');
const { buildAdaptivePlan, buildPlan } = require('../services/planService');
const { buildMockResponse, callLLM } = require('../services/aiService');

const learnerToken = jwt.sign(
  { id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'student' },
  JWT_SECRET
);
const adminToken = jwt.sign(
  { id: '507f1f77bcf86cd799439012', email: 'admin@example.com', role: 'admin' },
  JWT_SECRET
);
const authorization = { Authorization: `Bearer ${learnerToken}` };
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint reports API and database status without requiring authentication', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  const health = await response.json();
  const databaseConnected = mongoose.connection.readyState === 1;
  assert.equal(health.api, 'running');
  assert.equal(health.database, databaseConnected ? 'connected' : 'disconnected');
  assert.equal(health.status, databaseConnected ? 'healthy' : 'degraded');
});

test('readiness endpoint reports unavailable when MongoDB is disconnected', async () => {
  const response = await fetch(`${baseUrl}/ready`);
  const readiness = await response.json();
  const databaseConnected = mongoose.connection.readyState === 1;
  assert.equal(response.status, databaseConnected ? 200 : 503);
  assert.equal(readiness.status, databaseConnected ? 'ready' : 'not_ready');
  assert.equal(readiness.database, databaseConnected ? 'connected' : 'disconnected');
});

test('protected routes reject requests without a bearer token', async () => {
  const response = await fetch(`${baseUrl}/study-plans`);
  assert.equal(response.status, 401);
});

test('admin APIs reject requests without an authenticated admin role', async () => {
  const noTokenResponse = await fetch(`${baseUrl}/admin/admins`);
  assert.equal(noTokenResponse.status, 401);

  const studentResponse = await fetch(`${baseUrl}/admin/admins`, {
    headers: authorization,
  });
  assert.equal(studentResponse.status, 403);
});

test('admin account creation validates fields before storing an account', async () => {
  const response = await fetch(`${baseUrl}/admin/admins`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'not-an-email', password: 'short' }),
  });
  assert.equal(response.status, 400);
});

test('account registration rejects roles other than student or admin', async () => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Role Check',
      email: 'role-check@example.test',
      password: 'test-password-123',
      role: 'superuser',
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /student or admin/i);
});

test('admin registration rejects requests without an authorized invite code', async () => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Admin Check',
      email: 'admin-check@example.test',
      password: 'test-password-123',
      role: 'admin',
      adminSignupCode: 'incorrect-code',
    }),
  });
  assert.ok([403, 503].includes(response.status));
});

test('goal analysis validates required mission fields before persistence', async () => {
  const response = await fetch(`${baseUrl}/goals/analyze`, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal: 'Learn JavaScript' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /required/i);
});

test('plan generation rejects an out-of-range study time', async () => {
  const response = await fetch(`${baseUrl}/study-plans/generate`, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ hoursPerDay: 0.25 }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /between 0.5 and 16/i);
});

test('note creation validates content before attempting storage', async () => {
  const response = await fetch(`${baseUrl}/notes`, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Notes', content: ' ' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /content is required/i);
});

test('practice feedback validates score bounds before attempting storage', async () => {
  const response = await fetch(`${baseUrl}/progress/feedback`, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept: 'Functions', score: 101 }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /between 0 and 100/i);
});

test('plan builder respects daily hours and emits proposed task sequence', () => {
  const plan = buildPlan({
    title: 'Learn Async JavaScript',
    exam: 'Async/Await',
    weakArea: 'Async/Await',
    hoursPerDay: 2,
    skillLevel: 'Beginner',
    existingKnowledge: '',
  });
  assert.ok(plan.tasks.length > 0);
  assert.ok(plan.tasks.every((task) => task.estimatedHours <= 2));
  assert.ok(plan.adaptiveReasoning.length > 0);
});

test('adaptive plan adds focused review for a low self-reported score', () => {
  const plan = buildAdaptivePlan(
    { title: 'Learn JavaScript', exam: 'JavaScript', hoursPerDay: 2 },
    { concept: 'Functions', score: 45 }
  );
  assert.match(plan.tasks[0].title, /review.*fundamentals/i);
  assert.match(plan.adaptiveReasoning[0], /learner-reported.*45%/i);
});

test('mentor explains JavaScript instead of treating the weakArea context key as user intent', () => {
  const context = {
    question: 'explain about javascript',
    mission: { weakArea: '' },
    graphConcepts: [{ name: 'MongoDB', masteryScore: 54 }],
    nextActions: [],
    noteConcepts: [],
  };
  const serializedPrompt = `Learner context (JSON): ${JSON.stringify(context)}\n\nLearner question: ${context.question}`;
  const answer = buildMockResponse(serializedPrompt, context);

  assert.match(answer, /JavaScript is a high-level programming language/i);
  assert.match(answer, /Node\.js/);
  assert.doesNotMatch(answer, /weak in a topic|MongoDB at 54%/i);
});

test('mentor answers a loop question with loop-specific guidance despite unrelated context', () => {
  const context = {
    question: 'Explain loops and loop conditions in JavaScript',
    mission: { weakArea: 'MongoDB' },
    graphConcepts: [{ name: 'MongoDB', masteryScore: 54 }],
    nextActions: [],
    noteConcepts: [],
  };
  const serializedPrompt = `Learner context (JSON): ${JSON.stringify(context)}\n\nLearner question: ${context.question}`;
  const answer = buildMockResponse(serializedPrompt, context);

  assert.match(answer, /A loop repeats a block of code/i);
  assert.match(answer, /does not run forever/i);
  assert.doesNotMatch(answer, /MongoDB|weak area/i);
});

test('local mentor does not invent an answer for unsupported or multi-part questions', () => {
  const context = {
    question: 'What are Python decorators? Also, how do generators work?',
    mission: { weakArea: 'MongoDB' },
    graphConcepts: [{ name: 'MongoDB', masteryScore: 54 }],
    nextActions: [],
    noteConcepts: [],
  };
  const serializedPrompt = `Learner context (JSON): ${JSON.stringify(context)}\n\nLearner question: ${context.question}`;

  assert.equal(buildMockResponse(serializedPrompt, context), null);
});

test('local Ollama provider receives the exact question and returns its model answer', async () => {
  const originalFetch = global.fetch;
  let requestUrl;
  let requestBody;
  global.fetch = async (url, options) => {
    requestUrl = url;
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ message: { content: 'A direct answer from the local model.' } }),
    };
  };

  try {
    const result = await callLLM(
      'Answer directly.',
      'The learner’s exact question is:\nWhat is a JavaScript promise?',
      { question: 'What is a JavaScript promise?' },
      true
    );

    assert.equal(requestUrl, 'http://127.0.0.1:11434/api/chat');
    assert.equal(requestBody.model, 'qwen2.5:3b');
    assert.equal(requestBody.stream, false);
    assert.match(requestBody.messages[1].content, /What is a JavaScript promise/);
    assert.deepEqual(result, { answer: 'A direct answer from the local model.', mode: 'local-model' });
  } finally {
    global.fetch = originalFetch;
  }
});

test('local mentor identifies when the configured Ollama model is missing', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 404 });

  try {
    const result = await callLLM(
      'Answer directly.',
      'How do quantum tunneling equations work?',
      { question: 'How do quantum tunneling equations work?' },
      true
    );

    assert.match(result.answer, /ollama pull qwen2\.5:3b/i);
    assert.equal(result.mode, 'local-fallback');
  } finally {
    global.fetch = originalFetch;
  }
});
