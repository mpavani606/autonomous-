const {
  AI_PROVIDER,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  OPENAI_API_KEY,
} = require('../config/env');
const { knowledgeGraph } = require('../utils/demoData');

const buildMockResponse = (prompt, context) => {
  const lowerPrompt = (context.question || prompt).trim().toLowerCase();
  const asksForExplanation = /\b(explain|what is|what are|describe|how does|how do|tell me about)\b/.test(lowerPrompt);
  const questionIntents = lowerPrompt.match(/\b(explain|what is|what are|describe|how does|how do|tell me about)\b/g) || [];

  if (questionIntents.length > 1 || (lowerPrompt.match(/\?/g) || []).length > 1) {
    return null;
  }

  if (asksForExplanation && /\buseeffect|use effect\b/.test(lowerPrompt)) {
    return 'In React, useEffect runs a side effect after a render. Add the values it reads to the dependency array; use an empty array for work that should run after the initial render. If the effect creates a subscription or timer, return a cleanup function. In development Strict Mode, React may run setup and cleanup an extra time to help reveal unsafe effects.';
  }

  if (asksForExplanation && /\b(loop|loops|iteration|iterations|for loop|while loop)\b/.test(lowerPrompt)) {
    return 'A loop repeats a block of code while a condition is true or until a sequence is exhausted. In JavaScript, use `for (let i = 0; i < 3; i += 1) { console.log(i); }` when you control the iteration with a counter. Use `for...of` to visit each value in an iterable, and use `while` when repetition depends on a condition. Make sure the loop makes progress toward stopping so it does not run forever.';
  }

  if (asksForExplanation && /\bjavascript|js\b/.test(lowerPrompt)) {
    return 'JavaScript is a high-level programming language used to build interactive web pages and applications. It runs in browsers and on servers such as Node.js, and it supports functions, objects, and asynchronous work. For example, `const greeting = (name) => "Hello, " + name + "!";` defines a function that returns a personalized greeting. On the web, JavaScript can respond to clicks, update page content, and fetch data from APIs.';
  }

  if (/\b(weakest topic|weak area|my weak(?:est)?|am i weak|which (?:topic|area).*weak|where am i struggling|what should i improve)\b/.test(lowerPrompt)) {
    if (context.mission?.weakArea) {
      return `${context.mission.weakArea} is a topic you identified as needing help in your mission; that is self-reported, not an assessed result. Your plan proposes these next steps: ${context.nextActions.map((task) => task.title).join(', ') || 'a focused review and knowledge check'}.`;
    }
    const lowestDemoConcept = [...context.graphConcepts].sort((first, second) => first.masteryScore - second.masteryScore)[0];
    if (lowestDemoConcept) {
      return `I can't tell whether you're weak in a topic from the available learner data. The representative demo graph shows ${lowestDemoConcept.name} at ${lowestDemoConcept.masteryScore}% mastery; that is sample data, not your assessment. Tell me which topic or recent result you'd like help reviewing.`;
    }
    return 'I do not have assessment results to identify a weak topic. Tell me which concept feels difficult, or share a recent result, and I can help you choose a review step.';
  }

  if (/\b(what should i study|what(?:'s| is) my plan|show me (?:my )?plan|recommend(?: a)? study plan|plan for today|what should i do today|today'?s plan)\b/.test(lowerPrompt)) {
    const tasks = context.nextActions || [];
    if (tasks.length) {
      const hours = context.mission?.hoursPerDay;
      const timeBudget = hours ? ` Keep within your ${hours}-hour daily budget.` : '';
      return `Your current mission is "${context.mission.goal}". The next proposed action is ${tasks[0].title}${tasks[0].day ? ` (${tasks[0].day})` : ''}.${tasks.length > 1 ? ` After that: ${tasks.slice(1, 3).map((task) => task.title).join(', ')}.` : ''}${timeBudget} These are suggestions for you to review, not actions the agent has taken.`;
    }
    return context.mission?.goal
      ? `Your current mission is "${context.mission.goal}", but there are no saved proposed actions to consult. Open the mission setup to ask the agent for a plan.`
      : 'There is no active mission or proposed plan available yet. Set up a learning goal first, then I can help you review its suggested next actions.';
  }

  return null;
};

const callLLM = async (systemPrompt, userPrompt, context = {}, includeMode = false) => {
  if (AI_PROVIDER === 'ollama') {
    let unavailableMessage = 'The local AI model is unavailable. Start Ollama and try again.';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      let response;
      try {
        response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            stream: false,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            options: { temperature: 0.2 },
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        if (response.status === 404) {
          unavailableMessage = `The local model "${OLLAMA_MODEL}" is not installed. Run "ollama pull ${OLLAMA_MODEL}" and try again.`;
        }
        throw new Error(`Ollama request failed with status ${response.status}.`);
      }
      const data = await response.json();
      const answer = data.message?.content;
      if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error('Ollama returned an empty response.');
      }
      return includeMode ? { answer: answer.trim(), mode: 'local-model' } : answer.trim();
    } catch (error) {
      console.warn('Local Ollama model is unavailable; using supported demo responses.', error.message);
      const answer = buildMockResponse(userPrompt, context)
        || unavailableMessage;
      return includeMode ? { answer, mode: 'local-fallback' } : answer;
    }
  }

  if (!OPENAI_API_KEY) {
    const answer = buildMockResponse(userPrompt, context)
      || 'I can’t answer that reliably with the local responder. Configure an AI provider for answers to a wider range of questions.';
    return includeMode ? { answer, mode: 'local-demo' } : answer;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`AI provider request failed with status ${response.status}.`);
    }
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      throw new Error('AI provider returned an empty response.');
    }
    return includeMode ? { answer: answer.trim(), mode: 'configured-model' } : answer.trim();
  } catch (error) {
    console.warn('LLM call failed; using local reasoning fallback.', error.message);
    const answer = buildMockResponse(userPrompt, context)
      || 'I can’t answer that reliably right now because the AI provider is unavailable. Please try again later.';
    return includeMode ? { answer, mode: 'local-fallback' } : answer;
  }
};

const generateStudyPlan = async (goalInput) => {
  const systemPrompt = 'You are a study-planning agent. Use only the learner-provided context, respect the daily time budget, and distinguish self-reported gaps from assessed performance. Propose actions; do not claim to execute them.';
  const userPrompt = `Analyze this learner mission and propose a concise plan: ${JSON.stringify(goalInput)}`;
  const skillLevel = goalInput.skillLevel;
  const response = AI_PROVIDER === 'openai' || AI_PROVIDER === 'ollama'
    ? await callLLM(systemPrompt, userPrompt, goalInput)
    : `A proposed ${goalInput.exam} plan for "${goalInput.title}". Start at ${skillLevel} level, use up to ${goalInput.hoursPerDay} hours per day, and study with a ${goalInput.learningStyle} approach. ${goalInput.weakArea ? `Prioritize your self-reported focus area, ${goalInput.weakArea}.` : `Begin with a knowledge check in ${goalInput.exam} to identify a focus area.`}`;
  return {
    summary: response,
    reasoning: goalInput.weakArea
      ? `Learner-reported focus area: ${goalInput.weakArea}.`
      : 'No self-reported focus area or assessment result was provided.',
  };
};

const analyzeNoteLocally = (note) => {
  const sentences = (note.match(/[^.!?]+[.!?]?/g) || [note])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const summary = sentences.slice(0, 2).join(' ');
  const knownConcepts = [
    'JavaScript',
    'React',
    'MongoDB',
    'SQL',
    'Promises',
    'Async/Await',
    'Functions',
    'Algorithms',
    'Node.js',
    'AWS',
    'VPC',
    'Subnets',
    'Route Tables',
    'Security Groups',
    'Cloud Computing',
    'Networking',
  ];
  const concepts = knownConcepts.filter((concept) => {
    const escapedConcept = concept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escapedConcept}\\b`, 'i').test(note);
  });
  const graphConcepts = knowledgeGraph.nodes.filter((node) => node.kind === 'concept');
  const matchedGraphConcepts = graphConcepts.filter((node) => (
    new RegExp(`\\b${node.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(note)
  ));
  const matchedIds = new Set(matchedGraphConcepts.map((concept) => concept.id));
  const graphEdges = knowledgeGraph.edges.filter((edge) => (
    matchedIds.has(edge.source) && matchedIds.has(edge.target)
  ));
  const graphPrerequisites = [];
  const traversedPrerequisiteIds = new Set();
  const collectPrerequisites = (concept, requiredBy) => {
    for (const edge of knowledgeGraph.edges) {
      if (edge.type !== 'PREREQUISITE_OF' || edge.target !== concept.id) continue;
      const prerequisite = graphConcepts.find((candidate) => candidate.id === edge.source);
      if (!prerequisite) continue;
      if (!matchedIds.has(prerequisite.id)) {
        graphPrerequisites.push({ concept: prerequisite.name, requiredBy });
      }
      if (!traversedPrerequisiteIds.has(prerequisite.id)) {
        traversedPrerequisiteIds.add(prerequisite.id);
        collectPrerequisites(prerequisite, requiredBy);
      }
    }
  };
  matchedGraphConcepts.forEach((concept) => collectPrerequisites(concept, concept.name));
  const missingPrerequisites = [...new Map(
    graphPrerequisites.map((item) => [`${item.concept}:${item.requiredBy}`, item])
  ).values()];
  const definitions = sentences.flatMap((sentence) => {
    const match = sentence.match(/^(.{2,60}?)\s+(?:is|are|means|refers to)\s+(.+)[.!?]?$/i)
      || sentence.match(/^(.{2,60}?)\s*:\s*(.+)[.!?]?$/i);
    return match ? [{ term: match[1].trim(), definition: match[2].trim() }] : [];
  }).slice(0, 8);
  const keyPoints = sentences.slice(0, 5);
  const flashcardConcepts = concepts.length ? concepts.slice(0, 3) : ['Key idea'];

  return {
    summary: summary.length > 400 ? `${summary.slice(0, 397).trimEnd()}...` : summary,
    concepts,
    keyPoints,
    definitions,
    flashcards: flashcardConcepts.map((concept) => ({
      question: concept === 'Key idea' ? 'What is the main idea in these notes?' : `What do these notes say about ${concept}?`,
      answer: sentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) || summary,
    })),
    graphLinks: {
      nodes: matchedGraphConcepts.map(({ id, conceptId, name, subject }) => ({ id, conceptId, name, subject })),
      edges: graphEdges,
    },
    missingPrerequisites,
  };
};

const summarizeNote = async (note) => {
  const localAnalysis = analyzeNoteLocally(note);
  const summary = AI_PROVIDER === 'openai' || AI_PROVIDER === 'ollama'
    ? await callLLM(
      'You are the note-taking agent. Extract key concepts and produce a concise summary.',
      `Note: ${note}`,
      {}
    )
    : localAnalysis.summary;

  return {
    ...localAnalysis,
    summary,
  };
};

const generateMentorReply = async (question, context = {}) => {
  const systemPrompt = 'Answer the learner’s exact question directly and concisely. If they ask multiple questions, answer each one in order and do not omit any. Do not answer a different question, add unsolicited advice, or include unrelated background. Use learner context only when it is directly relevant to the question. Treat graph scores as representative sample data, never as the learner’s actual performance. If you are uncertain or the supplied context is insufficient, say so briefly and ask one focused follow-up. Never invent facts or claim to have executed actions.';
  const userPrompt = `The learner’s exact question is:\n${question}\n\nRelevant learner context, only if needed to answer the question (JSON): ${JSON.stringify(context)}`;
  return callLLM(systemPrompt, userPrompt, { ...context, question }, true);
};

module.exports = {
  generateStudyPlan,
  summarizeNote,
  generateMentorReply,
  callLLM,
  buildMockResponse,
};
