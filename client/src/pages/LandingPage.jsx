import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BookOpen, CheckCircle2, ClipboardCheck, Sparkles, Target, TrendingUp, Bell, Volume2 } from 'lucide-react';
import studyLearningFlow from '../assets/smart-study-planner-learning-flow.svg';
import agenticRoadmap from '../assets/agentic-learning-flow-1.jpg';
import agenticArchitecture from '../assets/agentic-learning-flow-2.jpg';
import documentLearningFlow from '../assets/agentic-learning-flow-3.jpg';
import agenticCollaboration from '../assets/autonomous-agent-concept-1.jpg';
import agenticEducation from '../assets/autonomous-agent-concept-2.jpg';
import agenticLearning from '../assets/autonomous-agent-concept-3.jpg';
import personalizedDashboardOverview from '../assets/personalized-dashboard-1.jpg';
import personalizedDashboardPlan from '../assets/personalized-dashboard-2.jpg';
import personalizedDashboardDevices from '../assets/personalized-dashboard-3.jpg';
import adaptiveLearningLoop from '../assets/self-adaptive-learning-flow-1.jpg';
import agenticLearningCycle from '../assets/self-adaptive-learning-flow-2.jpg';
import adaptiveResponseFlow from '../assets/self-adaptive-learning-flow-3.jpg';
import agenticDesignPatterns from '../assets/agentic-design-patterns.jpg';
import autonomousAgentInfographic from '../assets/autonomous-ai-agent-perceive-decide-act.png';

const speakWelcome = (onError, onSpeaking) => {
  if (!('speechSynthesis' in window)) {
    onError('Voice welcome is not supported by this browser.');
    onSpeaking(false);
    return;
  }

  window.speechSynthesis.cancel();
  const greeting = new SpeechSynthesisUtterance('Welcome to my Autonomous Study Planner');
  const englishVoices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en'));
  const feminineVoice = englishVoices.find((voice) =>
    /female|samantha|ava|jenny|aria|zira|hazel|susan|michelle|tessa|karen|fiona|moira|salli|joanna|kendra|kimberly|ivy/i.test(voice.name),
  );
  greeting.lang = 'en-US';
  greeting.voice = feminineVoice || englishVoices.find((voice) => voice.lang === 'en-US') || englishVoices[0] || null;
  greeting.rate = 0.9;
  greeting.pitch = 1.2;
  greeting.onstart = () => onSpeaking(true);
  greeting.onend = () => onSpeaking(false);
  greeting.onerror = () => {
    onSpeaking(false);
    onError('Unable to play the welcome voice. Please try again.');
  };
  onError('');
  window.speechSynthesis.speak(greeting);
};

const LandingPage = () => {
  const [voiceError, setVoiceError] = useState('');
  const [isWelcomeSpeaking, setIsWelcomeSpeaking] = useState(false);
  const [stats, setStats] = useState({ progress: 0, streak: 0, hours: 0 });
  const demoRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ('speechSynthesis' in window) speakWelcome(setVoiceError, setIsWelcomeSpeaking);
    }, 900);
    return () => {
      window.clearTimeout(timer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const targets = { progress: 72, streak: 14, hours: 3 };
    const startedAt = performance.now();
    let frameId;
    const animateStats = (now) => {
      const progress = Math.min(1, (now - startedAt) / 1200);
      const eased = 1 - ((1 - progress) ** 3);
      setStats({
        progress: Math.round(targets.progress * eased),
        streak: Math.round(targets.streak * eased),
        hours: Math.round(targets.hours * eased),
      });
      if (progress < 1) frameId = window.requestAnimationFrame(animateStats);
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setStats(targets);
    } else {
      frameId = window.requestAnimationFrame(animateStats);
    }
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const playWelcome = () => {
    if (isWelcomeSpeaking) {
      window.speechSynthesis.cancel();
      setIsWelcomeSpeaking(false);
      return;
    }

    speakWelcome(setVoiceError, setIsWelcomeSpeaking);
  };

  return (
    <div className="landing-page">
      <section className="landing-hero reference-hero">
        <div className="reference-blob reference-blob-one" aria-hidden="true" />
        <div className="reference-blob reference-blob-two" aria-hidden="true" />
        <div className="reference-blob reference-blob-three" aria-hidden="true" />
        <header className="topbar">
          <div className="brand-row">
            <div className="brand-icon">A</div>
            <strong>Autonomous Study Planner</strong>
          </div>
          <div className="landing-actions">
            <button type="button" className={`secondary-button welcome-voice-button ${isWelcomeSpeaking ? 'is-speaking' : ''}`} onClick={playWelcome} aria-pressed={isWelcomeSpeaking}>
              <Volume2 size={16} /> {isWelcomeSpeaking ? 'Speaking…' : 'Hear Welcome'}
            </button>
            <Link to="/login" className="secondary-button">Login</Link>
            <Link to="/register" className="gradient-button">Create My Study Plan</Link>
          </div>
        </header>

        <div className="hero-section reference-grid">
          <div className="hero-copy">
            <span className="eyebrow">AI-powered · personalized learning</span>
            <h1>Autonomous <span>Study Planner</span></h1>
            <h2 className="hero-subtitle">Plan Smarter. Learn Better. Achieve More.</h2>
            <p>
              Your learning companion turns a goal and your stated context into
              proposed study steps. Share feedback to request updated recommendations.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="gradient-button">Create My Study Plan</Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Explore Agent Workflow
              </button>
            </div>
            <div className="hero-metrics reference-stats" aria-label="Representative demo signals">
              <div><strong>{stats.progress}%</strong><span>Sample progress</span></div>
              <div><strong>{stats.streak} days</strong><span>Sample streak</span></div>
              <div><strong>{stats.hours} hrs/day</strong><span>Example time budget</span></div>
            </div>
          </div>

          <div className={`reference-stage ${isWelcomeSpeaking ? 'is-speaking' : ''}`} aria-label="Friendly AI learning guide">
            <div className="reference-halo" aria-hidden="true" />
            <div className="reference-card reference-goals"><Sparkles size={15} /> Your Goals<br />Our AI<br />Your Success</div>
            <div className="reference-card reference-step reference-step-success" aria-hidden="true">Succeed</div>
            <div className="reference-card reference-step reference-step-learn" aria-hidden="true">Learn</div>
            <div className="reference-card reference-step reference-step-practice" aria-hidden="true">Practice</div>
            <span className="reference-spark reference-spark-one" aria-hidden="true">✦</span>
            <span className="reference-spark reference-spark-two" aria-hidden="true">✦</span>
            <div className="reference-speech" aria-live="polite">Welcome to my Autonomous Study Planner!</div>
            <button
              type="button"
              className={`reference-girl ${isWelcomeSpeaking ? 'is-speaking' : ''}`}
              onClick={playWelcome}
              aria-label={isWelcomeSpeaking ? 'Stop the welcome voice' : 'Hear the welcome voice'}
              aria-pressed={isWelcomeSpeaking}
            >
              <svg viewBox="0 0 300 330" role="presentation">
                <g className="reference-hair">
                  <path d="M70 150c-20-90 40-125 82-125s100 35 78 125c-6 30-6 50-14 70H84c-10-20-10-40-14-70z" fill="#2a1030" />
                </g>
                <path d="M60 330c4-60 40-84 90-84s86 24 90 84z" fill="#ff5fa2" />
                <rect x="128" y="205" width="44" height="44" rx="16" fill="#f1b896" />
                <ellipse cx="150" cy="150" rx="62" ry="70" fill="#f8cfb0" />
                <path d="M88 138c10-45 40-58 66-58 34 0 56 26 58 58-22-22-46-30-74-30-22 0-38 10-50 30z" fill="#2a1030" />
                <ellipse cx="124" cy="156" rx="7" ry="9" fill="#2a1030" className="reference-eye" />
                <ellipse cx="176" cy="156" rx="7" ry="9" fill="#2a1030" className="reference-eye" />
                <circle cx="127" cy="152" r="2.4" fill="#fff" />
                <circle cx="179" cy="152" r="2.4" fill="#fff" />
                <ellipse cx="108" cy="180" rx="11" ry="7" fill="#ff8fa8" opacity=".55" />
                <ellipse cx="192" cy="180" rx="11" ry="7" fill="#ff8fa8" opacity=".55" />
                <ellipse cx="150" cy="190" rx="14" ry="7" fill="#b3123f" className={`reference-mouth ${isWelcomeSpeaking ? 'is-speaking' : ''}`} />
                <rect x="70" y="250" width="160" height="82" rx="10" fill="#c9a8ff" />
                <rect x="146" y="285" width="10" height="10" rx="2" fill="#5b2a9e" />
              </svg>
            </button>
          </div>
        </div>
        {voiceError && <p className="welcome-voice-error" role="status">{voiceError}</p>}
      </section>

    <section ref={demoRef} className="landing-section" aria-labelledby="how-it-works-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="how-it-works-title">How It Works</h2>
          <p>How your agent turns a goal into adaptive actions</p>
        </div>
        <span />
      </div>
      <div className="steps-grid">
        <article className="step-card step-blue">
          <div className="step-title"><span className="step-number">1</span><h3>Set a Goal</h3></div>
          <div className="step-illustration"><Target size={48} /><BookOpen size={36} /></div>
          <p>Give the agent your outcome, time budget, and current knowledge.</p>
        </article>
        <article className="step-card step-purple">
          <div className="step-title"><span className="step-number">2</span><h3>Agent Reasons</h3></div>
          <div className="step-illustration"><BrainCircuit size={54} /><Sparkles size={30} /></div>
          <p>It maps prerequisites, detects gaps, and selects useful next actions.</p>
        </article>
        <article className="step-card step-green">
          <div className="step-title"><span className="step-number">3</span><h3>Agent Acts</h3></div>
          <div className="step-illustration"><ClipboardCheck size={48} /><CheckCircle2 size={32} /></div>
          <p>It organizes focused tasks and recommendations around your goal.</p>
        </article>
        <article className="step-card step-orange">
          <div className="step-title"><span className="step-number">4</span><h3>Observe &amp; Adapt</h3></div>
          <div className="step-illustration"><TrendingUp size={48} /><CheckCircle2 size={32} /></div>
          <p>It uses performance signals to adjust what it recommends next.</p>
        </article>
      </div>
    </section>

    <section className="landing-section learning-flow-section" aria-labelledby="learning-flow-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="learning-flow-title">Inside Your Learning Agent</h2>
          <p>Observe your goal, reason through a path, take action, and adapt from feedback</p>
        </div>
        <span />
      </div>
      <div className="learning-flow-image">
        <img
          src={studyLearningFlow}
          alt="Student goal flows through AI agents, a knowledge graph, personalized planning, learning activities and performance analysis into automatic replanning."
        />
      </div>
      <div className="learning-flow-gallery" aria-label="Additional agentic learning flow diagrams">
        <figure className="learning-flow-card">
          <img
            src={agenticRoadmap}
            alt="AI study planner roadmap from student inputs to an AI-generated dashboard, topic breakdown, learning resources and a generated plan."
          />
          <figcaption>AI Study Planner Roadmap</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={agenticArchitecture}
            alt="Agent architecture connecting a student prompt to tools, memory and planning before returning a response or action."
          />
          <figcaption>Agentic System Architecture</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={documentLearningFlow}
            alt="Document-powered learning flow connecting a user query and uploaded documents to a planner, RAG database, explanations, quizzes, images and a course."
          />
          <figcaption>Document-Powered Learning Workflow</figcaption>
        </figure>
      </div>
    </section>

    <section className="landing-section agent-concept-section" aria-labelledby="agent-concept-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="agent-concept-title">Autonomous AI Agent Concept</h2>
          <p>How AI agents collaborate with students to support learning</p>
        </div>
        <span />
      </div>
      <div className="learning-flow-gallery" aria-label="Autonomous AI agent concept illustrations">
        <figure className="learning-flow-card">
          <img
            src={agenticCollaboration}
            alt="A student discussing ideas with a friendly AI robot while studying at a laptop."
          />
          <figcaption>Student and AI Collaboration</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={agenticEducation}
            alt="An AI robot and teacher guiding students through an educational presentation."
          />
          <figcaption>Agentic AI in Education</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={agenticLearning}
            alt="A student learning alongside an AI robot with an interactive learning dashboard."
          />
          <figcaption>AI Agent Learning in Action</figcaption>
        </figure>
      </div>
    </section>

    <section className="landing-section agentic-patterns-section" aria-labelledby="agentic-patterns-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="agentic-patterns-title">Agentic Design Patterns</h2>
          <p>How an autonomous AI agent understands, plans, acts and learns</p>
        </div>
        <span />
      </div>
      <figure className="learning-flow-card agentic-patterns-card">
        <img
          src={agenticDesignPatterns}
          alt="Autonomous AI agent work cycle: understand the goal, plan, access tools, execute tasks, evaluate results, and learn and adapt."
        />
        <figcaption>Autonomous AI Agent Work Cycle</figcaption>
      </figure>
      <figure className="learning-flow-card agentic-patterns-card agentic-patterns-followup">
        <img
          src={autonomousAgentInfographic}
          alt="Autonomous AI agent perceives its environment, decides on a plan, uses tools and acts independently to achieve a goal."
        />
        <figcaption>Perceive, Decide, Use Tools and Act</figcaption>
      </figure>
    </section>

    <section className="landing-section dashboard-showcase-section" aria-labelledby="dashboard-showcase-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="dashboard-showcase-title">Your Agent Workbench</h2>
          <p>See what the agent is working on, what it recommends, and why</p>
        </div>
        <span />
      </div>
      <div className="learning-flow-gallery" aria-label="Personalized study dashboard examples">
        <figure className="learning-flow-card">
          <img
            src={personalizedDashboardOverview}
            alt="Dark personalized study dashboard with calendar, learning progress, recent lessons and an AI assistant."
          />
          <figcaption>Your Learning at a Glance</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={personalizedDashboardPlan}
            alt="Study dashboard showing learner details, subjects, a seven-day plan and daily study topics."
          />
          <figcaption>Your Personalized Study Plan</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={personalizedDashboardDevices}
            alt="Responsive study dashboard and learning schedule shown across a laptop and mobile devices."
          />
          <figcaption>Study Across Your Devices</figcaption>
        </figure>
      </div>
    </section>

    <section className="landing-section adaptive-learning-section" aria-labelledby="adaptive-learning-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="adaptive-learning-title">Self-Adaptive Learning Flow</h2>
          <p>A continuous cycle that adjusts study plans from learner progress and feedback</p>
        </div>
        <span />
      </div>
      <div className="learning-flow-gallery" aria-label="Self-adaptive learning flow diagrams">
        <figure className="learning-flow-card">
          <img
            src={adaptiveLearningLoop}
            alt="Adaptive learning loop that assesses weaknesses, gives instant feedback, guides student practice and suggests tailored practice."
          />
          <figcaption>The Adaptive Learning Loop</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={agenticLearningCycle}
            alt="Continuous agentic learning cycle moving through plan, act, observe and adapt."
          />
          <figcaption>Plan, Act, Observe and Adapt</figcaption>
        </figure>
        <figure className="learning-flow-card">
          <img
            src={adaptiveResponseFlow}
            alt="Student query flows through AI analysis, personalized content generation, adaptive response and learner feedback to update the AI."
          />
          <figcaption>Feedback-Driven AI Updates</figcaption>
        </figure>
      </div>
    </section>

    <section className="landing-section features-section" aria-labelledby="features-title">
      <div className="landing-section-heading">
        <span />
        <div>
          <h2 id="features-title">What Your Agent Does</h2>
          <p>Reasoning, planning, action, and continuous adaptation</p>
        </div>
        <span />
      </div>
      <div className="features-grid">
        <article className="feature-card feature-blue"><div><Target size={27} /></div><h3>Goal Setting</h3><p>Set your target and start your journey</p></article>
        <article className="feature-card feature-green"><div><BookOpen size={27} /></div><h3>Daily Study Plan</h3><p>Get a personalized plan</p></article>
        <article className="feature-card feature-purple"><div><TrendingUp size={27} /></div><h3>Progress Tracking</h3><p>Track your growth with real insights</p></article>
        <article className="feature-card feature-orange"><div><Bell size={27} /></div><h3>Reminders</h3><p>Never miss your tasks</p></article>
        <article className="feature-card feature-pink"><div><ClipboardCheck size={27} /></div><h3>Practice Activities</h3><p>Improve with quizzes &amp; tests</p></article>
        <article className="feature-card feature-cyan"><div><BrainCircuit size={27} /></div><h3>AI Mentor</h3><p>Get smart guidance anytime</p></article>
      </div>
    </section>

    <section className="goal-strip">
      <div className="goal-strip-icon"><Target size={36} /></div>
      <h2>Agent Mission</h2>
      <p>Your agent turns a learning outcome into <strong>clear next actions, useful feedback, and an adaptive path</strong>.</p>
      <div className="goal-strip-books" aria-hidden="true">📚</div>
    </section>
    </div>
  );
};

export default LandingPage;
