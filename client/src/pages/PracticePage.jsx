import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import { useStudyPlan, saveStudyPlan } from '../hooks/useStudyPlan';

const PracticePage = () => {
  const { user } = useAuth();
  const { plan, loading: planLoading, error: planError } = useStudyPlan();
  const { graph, loading: graphLoading, error: graphError } = useKnowledgeGraph();
  const [concept, setConcept] = useState('');
  const [score, setScore] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isCurrent = true;
    api.get('/progress')
      .then(({ data }) => {
        if (isCurrent) setFeedbackHistory(data.data.recentAssessments || []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load your saved feedback.');
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const concepts = useMemo(
    () => graph.nodes.filter((node) => node.kind === 'concept' || !node.kind),
    [graph.nodes]
  );
  const selectedConcept = concepts.find((item) => item.id === concept || item.conceptId === concept);
  const previousScore = feedbackHistory.find(
    (entry) => entry.concept.toLowerCase() === (selectedConcept?.name || concept).toLowerCase()
  )?.score ?? null;

  const submitFeedback = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!selectedConcept) {
      setError('Select a concept from the available knowledge graph.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/progress/feedback', {
        concept: selectedConcept.name,
        score: Number(score),
      });

      const updatedPlan = {
        ...data.data.plan,
        summary: data.data.message,
      };
      saveStudyPlan(updatedPlan, user);
      setFeedbackHistory((current) => [data.data.assessment, ...current].slice(0, 100));
      setScore('');
      setNotice('The agent adjusted its recommendations using your self-reported score. Review the updated plan before choosing your next action.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the plan from this feedback. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Learner feedback loop</span>
          <h2>Share a result to adapt proposed actions</h2>
          <p>Enter a score from your own practice or assessment. The agent uses it as self-reported feedback, not a verified result.</p>
        </div>
      </div>

      {planLoading ? <p role="status">Loading your mission...</p> : planError ? (
        <p className="form-error" role="alert">{planError}</p>
      ) : !plan ? (
        <div className="glass-card form-card">
          <h3>Set up a mission first</h3>
          <p>Once the agent has a goal and time budget, you can share a practice signal and request revised recommendations.</p>
          <Link className="gradient-button" to="/onboarding">Set up a mission</Link>
        </div>
      ) : (
        <>
          <section className="glass-card form-card">
            <span className="eyebrow">Active mission</span>
            <h3>{plan.goal}</h3>
            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="form-success" role="status">{notice}</p>}
            {graphLoading && <p role="status">Loading concepts...</p>}
            {graphError && <p className="form-error" role="alert">{graphError}</p>}
            <form className="feedback-form" onSubmit={submitFeedback}>
              <label>
                Concept
                <select required value={concept} onChange={(event) => setConcept(event.target.value)}>
                  <option value="">Choose a concept</option>
                  {concepts.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} · {item.subject}</option>
                  ))}
                </select>
              </label>
              <label>
                Your score (0–100)
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  placeholder="e.g. 72"
                />
              </label>
              {previousScore !== null && (
                <p className="feedback-history-hint">Your previous self-reported score for {selectedConcept?.name}: {previousScore}%.</p>
              )}
              <button className="gradient-button" type="submit" disabled={submitting || graphLoading || Boolean(graphError) || !selectedConcept || score === ''}>
                {submitting ? 'Adjusting recommendations...' : 'Use feedback to update my plan'}
              </button>
            </form>
          </section>

          <section className="glass-card form-card">
            <div className="panel-header">
              <h3>Recent learner-reported feedback</h3>
              <span className="pill">{feedbackHistory.length} saved to your account</span>
            </div>
            {feedbackHistory.length ? (
              <div className="task-list">
                {feedbackHistory.slice(0, 8).map((entry, index) => (
                  <div className="task-item" key={`${entry.concept}-${entry.recordedAt}-${index}`}>
                    <div>
                      <strong>{entry.concept}</strong>
                      <small>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.recordedAt))}</small>
                    </div>
                    <span className="task-badge">{entry.score}%{entry.previousScore !== null ? ` · ${entry.score - entry.previousScore > 0 ? '+' : ''}${entry.score - entry.previousScore}` : ''}</span>
                  </div>
                ))}
              </div>
            ) : <p>No feedback submitted yet. Enter a score above to see how the agent adjusts its suggestions.</p>}
          </section>
        </>
      )}
    </div>
  );
};

export default PracticePage;
