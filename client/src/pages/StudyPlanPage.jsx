import { Link } from 'react-router-dom';
import { useStudyPlan } from '../hooks/useStudyPlan';

const StudyPlanPage = () => {
  const { plan, loading, error } = useStudyPlan();

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Agent plan</span>
          <h2>Mission roadmap and next actions</h2>
        </div>
      </div>

      {loading ? (
        <p role="status">Loading your mission plan...</p>
      ) : error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : !plan ? (
        <div className="glass-card form-card">
          <h3>No active mission yet</h3>
          <p>Set a learning goal and context to ask the agent for proposed next actions.</p>
          <Link className="gradient-button" to="/onboarding">Set up a mission</Link>
        </div>
      ) : (
        <>
          <section className="glass-card form-card">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Proposed roadmap</span>
                <h3>{plan.goal}</h3>
              </div>
              <span className="pill">Recommendations to review</span>
            </div>

            <dl className="mission-details">
              {[
                plan.exam && { label: 'Mission domain', value: plan.exam },
                (plan.hoursPerDay || plan.missionContext?.hoursPerDay) && {
                  label: 'Available time',
                  value: `${plan.hoursPerDay || plan.missionContext.hoursPerDay} hours/day`,
                },
                plan.skillLevel && { label: 'Current level', value: plan.skillLevel },
                (plan.preferredStudyTime || plan.missionContext?.preferredStudyTime) && {
                  label: 'Preferred time',
                  value: plan.preferredStudyTime || plan.missionContext.preferredStudyTime,
                },
                (plan.learningStyle || plan.missionContext?.learningStyle) && {
                  label: 'Learning approach',
                  value: plan.learningStyle || plan.missionContext.learningStyle,
                },
                plan.targetDate && { label: 'Target date', value: plan.targetDate },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {plan.summary && <p className="plan-summary">{plan.summary}</p>}
            {plan.feedbackSignal && (
              <div className="feedback-signal">
                <strong>Latest learner-reported signal</strong>
                <span>{plan.feedbackSignal.concept}: {plan.feedbackSignal.score}%</span>
                {plan.feedbackSignal.change !== null && plan.feedbackSignal.change !== undefined && (
                  <span>
                    {plan.feedbackSignal.change > 0 ? '+' : ''}
                    {plan.feedbackSignal.change} points since the prior submitted score
                  </span>
                )}
              </div>
            )}

            <h4>Mission milestones</h4>
            <div className="timeline-grid">
              {(plan.milestones || []).map((milestone, index) => (
                <div key={`${index}-${milestone}`} className="timeline-item">
                  <span>{index + 1}</span>
                  <p>{milestone}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card form-card">
            <div className="panel-header">
              <h3>Proposed next actions</h3>
              <span className="pill success">{plan.tasks?.length || 0} suggestions</span>
            </div>
            {plan.tasks?.length ? (
              <div className="task-list full-width">
                {plan.tasks.map((task, index) => (
                  <div key={`${task.title}-${index}`} className="task-item">
                    <div className="task-dot" />
                    <div>
                      <strong>{task.title}</strong>
                      <small>{task.concept} · {task.type}{task.estimatedHours ? ` · ${task.estimatedHours} hours` : ''}</small>
                    </div>
                    <span className="task-badge">{task.day || `Step ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            ) : <p>No actions were proposed for this mission.</p>}
          </section>

          <section className="glass-card form-card">
            <div className="panel-header">
              <h3>Planning rationale and context</h3>
              <span className="pill">Demo knowledge graph</span>
            </div>
            <ul className="recommendations-list">
              {(plan.adaptiveReasoning || []).map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}
            </ul>
            {plan.knowledgeGraph?.nodes?.length > 0 && (
              <div className="graph-list plan-graph-list">
                {plan.knowledgeGraph.nodes.map((node) => (
                  <div key={node.id} className="graph-node">
                    <span className="node-pill">{node.name}</span>
                    <small>{node.subject}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudyPlanPage;
