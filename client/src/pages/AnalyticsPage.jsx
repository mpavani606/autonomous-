import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useProgress } from '../hooks/useProgress';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { masteryColors } from './dashboardData';

const AnalyticsPage = () => {
  const { progress, loading, error } = useProgress();
  const { plan } = useStudyPlan();

  const masteryData = useMemo(
    () => progress?.topicBreakdown || [],
    [progress]
  );
  const feedback = useMemo(() => progress?.recentAssessments || [], [progress]);
  const learnerScoreTrend = useMemo(
    () => [...feedback].reverse().map((entry) => ({
      name: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(entry.recordedAt)),
      concept: entry.concept,
      score: entry.score,
    })),
    [feedback]
  );
  const averageReportedScore = progress?.averageReportedScore ?? null;
  const isRepresentative = progress?.source === 'representative-demo';
  const isLearnerReported = progress?.source === 'learner-reported';
  const sourceLabel = isRepresentative
    ? 'Representative demo analytics — not live learner records'
    : isLearnerReported
      ? 'Learner-reported practice scores — not independently verified'
      : 'Learner progress signals';
  const statSourceLabel = isRepresentative
    ? 'Representative demo signal'
    : isLearnerReported
      ? 'Self-reported signal'
      : 'Learner progress record';

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Agent feedback signals</span>
          <h2>Progress and learning health</h2>
          <p>Review representative data separately from your saved, self-reported practice scores.</p>
        </div>
      </div>

      {loading && <p role="status">Loading progress signals...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {progress && (
        <section aria-label="Learning progress analytics">
          <div className="glass-card analytics-source">
            <span className="pill">{sourceLabel}</span>
          </div>
          <div className="stats-grid">
            <StatCard
              icon={<Target size={18} />}
              label={isLearnerReported ? 'Average Reported Score' : 'Overall Mastery'}
              value={isLearnerReported
                ? (averageReportedScore == null ? '—' : `${averageReportedScore}%`)
                : (progress.overallMastery == null ? '—' : `${progress.overallMastery}%`)}
              subValue={statSourceLabel}
            />
            <StatCard icon={<CheckCircle2 size={18} />} label="Quiz Accuracy" value={progress.accuracy == null ? '—' : `${progress.accuracy}%`} subValue={progress.accuracy == null ? 'No verified quiz records' : statSourceLabel} />
            <StatCard icon={<TrendingUp size={18} />} label="Study Streak" value={progress.streak == null ? '—' : `${progress.streak} days`} subValue={progress.streak == null ? 'No session history available' : statSourceLabel} />
            <StatCard icon={<BookOpen size={18} />} label="Study Hours" value={progress.studyHours == null ? '—' : `${progress.studyHours} hrs`} subValue={progress.studyHours == null ? 'No session history available' : statSourceLabel} />
          </div>
          <div className="dashboard-grid analytics-grid">
            <div className="glass-card chart-panel">
              <div className="panel-header">
                <h3>{isLearnerReported ? 'Latest self-reported concept scores' : 'Concept mastery'}</h3>
                <span className="pill">{isRepresentative ? 'Demo graph data' : isLearnerReported ? 'Self-reported feedback' : 'Learner records'}</span>
              </div>
              {masteryData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={masteryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,116,0.12)" />
                    <XAxis dataKey="name" stroke="#625d79" />
                    <YAxis domain={[0, 100]} stroke="#625d79" />
                    <Tooltip formatter={(value) => [
                      `${value}%`,
                      isLearnerReported ? 'Reported score' : 'Mastery',
                    ]} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {masteryData.map((entry, index) => <Cell key={entry.name} fill={masteryColors[index % masteryColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p>No mastery breakdown is available.</p>}
            </div>

            {progress.completionRate != null && <div className="glass-card chart-panel">
              <div className="panel-header">
                <h3>Completion rate</h3>
                <span className="pill">{isRepresentative ? 'Representative demo' : 'Learner record'}</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{ name: 'Completion', value: progress.completionRate }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,116,0.12)" />
                  <XAxis dataKey="name" stroke="#625d79" />
                  <YAxis domain={[0, 100]} stroke="#625d79" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                  <Bar dataKey="value" fill="#34d399" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
          </div>
        </section>
      )}

      <div className="dashboard-grid analytics-grid">
        <div className="glass-card chart-panel">
          <div className="panel-header">
            <h3>Self-reported practice scores</h3>
            <span className="pill">{feedback.length} saved to your account</span>
          </div>
          {learnerScoreTrend.length ? (
            <>
              {averageReportedScore != null && <p>Average latest score by concept: <strong>{averageReportedScore}%</strong></p>}
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={learnerScoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,116,0.12)" />
                  <XAxis dataKey="name" stroke="#625d79" />
                  <YAxis domain={[0, 100]} stroke="#625d79" />
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} labelFormatter={(label, items) => `${label}${items?.[0]?.payload?.concept ? ` · ${items[0].payload.concept}` : ''}`} />
                  <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : <p>No self-reported scores yet. Submit a practice score on the Practice page to see your signal here.</p>}
        </div>

        <div className="glass-card chart-panel">
          <div className="panel-header">
            <h3>Agent recommendations</h3>
            <span className="pill">For learner review</span>
          </div>
          {plan?.adaptiveReasoning?.length ? (
            <ul className="recommendations-list">
              {plan.adaptiveReasoning.map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}
            </ul>
          ) : <p>Set up a mission or submit a practice signal to see why the agent suggests its next actions.</p>}
          {plan?.tasks?.length > 0 && (
            <>
              <h4>Next proposed actions</h4>
              <ul className="recommendations-list">
                {plan.tasks.slice(0, 3).map((task, index) => <li key={`${task.title}-${index}`}>{task.title} · {task.day || `Step ${index + 1}`}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
