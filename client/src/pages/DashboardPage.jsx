import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, Bell, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';
import { useNotes } from '../hooks/useNotes';
import { useNotifications } from '../hooks/useNotifications';
import { useProgress } from '../hooks/useProgress';
import { useStudyPlan } from '../hooks/useStudyPlan';
import StatCard from '../components/StatCard';
import { masteryColors, statData } from './dashboardData';

const DashboardPage = () => {
  const { plan, loading: planLoading, error: planError } = useStudyPlan();
  const { progress, summary, error: progressError } = useProgress();
  const { graph, error: graphError } = useKnowledgeGraph();
  const { notes } = useNotes();
  const { notifications } = useNotifications();
  const { user } = useAuth();

  const isRepresentative = progress?.source === 'representative-demo';
  const isLearnerReported = progress?.source === 'learner-reported';
  const masteryData = useMemo(
    () => isRepresentative || isLearnerReported ? progress?.topicBreakdown || [] : [],
    [isRepresentative, isLearnerReported, progress]
  );
  const weakestTopics = useMemo(
    () => [...masteryData].sort((first, second) => first.value - second.value).slice(0, 3),
    [masteryData]
  );
  const graphConcepts = graph.nodes.filter((node) => node.kind === 'concept' || !node.kind);
  const agentReasoning = plan?.adaptiveReasoning || [];
  const missionDetails = [
    plan?.exam && { label: 'Mission domain', value: plan.exam },
    plan?.hoursPerDay && { label: 'Time budget', value: `${plan.hoursPerDay} hours/day` },
    plan?.skillLevel && { label: 'Current level', value: plan.skillLevel },
    plan?.learningStyle && { label: 'Preferred approach', value: plan.learningStyle },
    (plan?.weakArea || plan?.missionContext?.focusTopic) && {
      label: 'Focus topic',
      value: plan.weakArea || plan.missionContext.focusTopic,
    },
  ].filter(Boolean);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Agent command center</span>
          <h2>{user?.name || 'Janaki'} 👋</h2>
        </div>
        <span className="pill"><Bell size={16} /> {notifications.length} notifications</span>
      </div>

      <section className="glass-card mission-panel" aria-labelledby="active-mission-title">
        <div className="mission-panel-header">
          <div>
            <span className="eyebrow">Active mission</span>
            <h3 id="active-mission-title">{plan?.goal || 'Give your agent a learning goal'}</h3>
          </div>
          <Link className="secondary-button" to={plan ? '/plan' : '/onboarding'}>
            {plan ? 'View mission plan' : 'Set up a mission'}
          </Link>
        </div>
        {missionDetails.length > 0 && (
          <dl className="mission-details">
            {missionDetails.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <div className="stats-grid">
        <StatCard
          icon={<Target size={18} />}
          label={isLearnerReported ? 'Average Reported Score' : 'Overall Mastery'}
          value={isLearnerReported
            ? (progress.averageReportedScore == null ? '—' : `${progress.averageReportedScore}%`)
            : (summary.mastery === null ? '—' : `${summary.mastery}%`)}
          subValue={isRepresentative ? 'Representative demo signal' : isLearnerReported ? 'Self-reported practice score' : 'Reported progress'}
        />
        <StatCard icon={<TrendingUp size={18} />} label="Study Streak" value={progress?.streak == null ? '—' : `${progress.streak} days`} subValue="Progress signal" />
        <StatCard icon={<BookOpen size={18} />} label="Study Hours" value={summary.studyHours === null ? '—' : `${summary.studyHours} hrs`} subValue="Tracked this week" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Completion Rate" value={summary.completionRate === null ? '—' : `${summary.completionRate}%`} subValue="Progress signal" />
      </div>
      {progressError && <p className="form-error" role="alert">{progressError}</p>}

      <div className="glass-card insight-banner">
        <div>
          <span className="eyebrow">Agent reasoning</span>
          <h3>{agentReasoning[0] || 'Set up a mission to receive proposed next actions and their rationale.'}</h3>
        </div>
      </div>

      <div className="agent-grid">
        {[
          { title: 'Mission', text: plan?.goal || 'Awaiting a learner-defined goal.' },
          { title: 'Context', text: `${graphError ? 'Knowledge graph unavailable' : `${graphConcepts.length} graph concepts`} and ${notes.length} agent notes available.` },
          { title: 'Feedback', text: isRepresentative
            ? `${weakestTopics[0]?.name || 'No topic'} is the lowest topic in the representative demo signals${weakestTopics[0] ? ` at ${weakestTopics[0].value}%` : ''}.`
            : isLearnerReported
              ? `Your latest self-reported scores cover ${masteryData.length} concept${masteryData.length === 1 ? '' : 's'}.`
              : 'Progress records are available, but there are no concept-level practice scores yet.' },
          { title: 'Next action', text: plan?.tasks?.[0]?.title || 'Generate a mission plan to get started.' },
        ].map((agent) => (
          <div key={agent.title} className="glass-card agent-card">
            <strong>{agent.title}</strong>
            <p>{agent.text}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="glass-card large-panel">
          <div className="panel-header">
            <h3>Next Actions from Your Agent</h3>
            <span className="pill success">Proposed actions</span>
          </div>
          {planLoading ? <p>Loading plan...</p> : planError ? (
            <p className="form-error" role="alert">{planError}</p>
          ) : (
            <div className="task-list">
              {plan?.tasks?.length ? plan.tasks.map((task, index) => (
                <div key={index} className="task-item">
                  <div className="task-dot" />
                  <div>
                    <strong>{task.title}</strong>
                    <small>{task.concept} • {task.type}</small>
                  </div>
                  <span className="task-badge">{task.day || 'Today'}</span>
                </div>
              )) : <p>No proposed actions yet. Set up a mission to ask the agent for a plan.</p>}
            </div>
          )}
        </div>

        <div className="glass-card large-panel">
          <div className="panel-header">
            <h3>{isLearnerReported ? 'Learner-reported practice feedback' : isRepresentative ? 'Representative knowledge context' : 'Learner progress records'}</h3>
            <span className="pill alert">{isLearnerReported ? 'Scores are self-reported' : isRepresentative ? 'Demo progress signals' : 'Persisted learner records'}</span>
          </div>
          <ul className="risk-list">
            {weakestTopics.map(({ name, value }) => (
              <li key={name}><strong>{name}</strong><span>{value}% {isLearnerReported ? 'reported' : 'mastery'}</span></li>
            ))}
            {!weakestTopics.length && <li>No progress breakdown is available.</li>}
          </ul>
        </div>

        <div className="glass-card chart-panel">
          <div className="panel-header">
            <h3>Weekly study hours · representative demo</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,116,0.12)" />
              <XAxis dataKey="name" stroke="#625d79" />
              <YAxis stroke="#625d79" />
              <Tooltip />
              <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card chart-panel">
          <div className="panel-header">
            <h3>{isLearnerReported ? 'Self-reported scores' : isRepresentative ? 'Subject mastery · representative demo' : 'Learner concept scores'}</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={masteryData} innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2}>
                {masteryData.map((entry, index) => (
                  <Cell key={index} fill={masteryColors[index % masteryColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card large-panel">
          <div className="panel-header">
            <h3>Knowledge Graph</h3>
            <span className="pill">Active graph</span>
          </div>
          <div className="graph-list">
            {graphConcepts.slice(0, 5).map((node) => (
              <div key={node.id} className="graph-node">
                <span className="node-pill">{node.name}</span>
                <small>{node.subject}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card large-panel">
          <div className="panel-header">
            <h3>Why these actions?</h3>
          </div>
          <ul className="recommendations-list">
            {agentReasoning.map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}
          </ul>
        </div>

        <div className="glass-card large-panel">
          <div className="panel-header">
            <h3>Recent Notes</h3>
          </div>
          <div className="notes-list">
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className="note-item">
                <strong>{note.title}</strong>
                <p>{note.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card large-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
          </div>
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li key={n.id}><strong>{n.title}</strong><p>{n.message}</p></li>
            ))}
            {!notifications.length && <li>No notifications are available yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
