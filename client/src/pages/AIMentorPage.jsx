import { useMemo, useState } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import { useNotes } from '../hooks/useNotes';
import { useStudyPlan } from '../hooks/useStudyPlan';

const AIMentorPage = () => {
  const [question, setQuestion] = useState('');
  const { messages, loading, error, sendMessage, inputRef } = useAIChat();
  const { plan } = useStudyPlan();
  const { graph } = useKnowledgeGraph();
  const { notes } = useNotes();
  const context = useMemo(() => ({
    mission: plan ? {
      goal: plan.goal,
      exam: plan.exam,
      hoursPerDay: plan.hoursPerDay || plan.missionContext?.hoursPerDay,
      skillLevel: plan.skillLevel,
      weakArea: plan.weakArea || plan.missionContext?.focusTopic,
      existingKnowledge: plan.existingKnowledge || plan.missionContext?.existingKnowledge,
      learningStyle: plan.learningStyle || plan.missionContext?.learningStyle,
    } : {},
    nextActions: (plan?.tasks || []).map(({ title, concept, type, day, estimatedHours }) => ({
      title, concept, type, day, estimatedHours,
    })),
    graphConcepts: graph.nodes
      .filter((node) => node.kind === 'concept')
      .map(({ name, masteryScore }) => ({ name, masteryScore })),
    noteConcepts: [...new Set(notes.flatMap((note) => note.concepts || []))].slice(0, 20),
  }), [graph.nodes, notes, plan]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(question, context);
    setQuestion('');
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Agent conversation</span>
          <h2>Ask your agent to explain or recommend an action</h2>
          <p>Answers address your question directly. Graph scores are representative sample data, not your assessment.</p>
        </div>
      </div>
      <div className="glass-card chat-panel">
        <div className="chat-history">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role}`}>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about a concept, your mission, or a proposed next action"
            maxLength={2000}
            aria-label="Question for the learning mentor"
          />
          <button type="submit" className="gradient-button" disabled={loading || !question.trim()}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default AIMentorPage;
