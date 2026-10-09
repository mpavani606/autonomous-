import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveStudyPlan } from '../hooks/useStudyPlan';
import { useAuth } from '../context/AuthContext';

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultTargetDate = () => {
  const target = new Date();
  target.setMonth(target.getMonth() + 3);
  return toDateInputValue(target);
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [today] = useState(() => toDateInputValue(new Date()));
  const [form, setForm] = useState({
    goal: '',
    exam: '',
    hours: '2',
    skill: 'Beginner',
    time: 'Evening',
    date: getDefaultTargetDate(),
    knowledge: '',
    weakArea: '',
    style: 'Visual + practice',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generatePlan = async (event) => {
    event.preventDefault();
    setIsGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/goals/analyze', {
        goal: form.goal.trim(),
        exam: form.exam.trim(),
        hoursPerDay: Number(form.hours),
        weakArea: form.weakArea.trim(),
        skillLevel: form.skill,
        preferredStudyTime: form.time,
        targetDate: form.date,
        existingKnowledge: form.knowledge.trim(),
        learningStyle: form.style,
      });
      const plan = {
        ...data.data.result,
        goal: form.goal.trim(),
        exam: form.exam.trim(),
        hoursPerDay: Number(form.hours),
        skillLevel: form.skill,
        preferredStudyTime: form.time,
        targetDate: form.date,
        learningStyle: form.style,
        existingKnowledge: form.knowledge.trim(),
        weakArea: form.weakArea.trim(),
        summary: data.data.summary,
      };

      saveStudyPlan(plan, user);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not generate your plan. Please check the server connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Goal engine</span>
          <h2>Give your agent a mission</h2>
          <p>Share your goal and constraints. Your agent will prepare proposed next steps from your stated context.</p>
        </div>
      </div>
      <form className="glass-card form-card onboarding-form" onSubmit={generatePlan}>
        <div className="two-column-form">
          <label>
            Learning goal
            <input required maxLength={160} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Learn the fundamentals of data science" />
          </label>
          <label>
            Goal domain or target
            <input required maxLength={100} value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} placeholder="e.g. Data science, GATE, or a project" />
          </label>
          <label>
            Available study time per day (hours)
            <input required type="number" min="0.5" max="16" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          </label>
          <label>
            Current skill level
            <select value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label>
            Preferred study time
            <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Flexible</option>
            </select>
          </label>
          <label>
            Target date
            <input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label>
            Topics you want help strengthening <span className="field-hint">(optional; based on your self-assessment)</span>
            <input maxLength={100} value={form.weakArea} onChange={(e) => setForm({ ...form, weakArea: e.target.value })} placeholder="e.g. SQL joins or calculus" />
          </label>
          <label>
            What you already know
            <textarea maxLength={1000} value={form.knowledge} onChange={(e) => setForm({ ...form, knowledge: e.target.value })} placeholder="List concepts, experience, or prerequisites you have covered" />
          </label>
          <label>
            Preferred learning approach
            <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
              <option>Visual + practice</option>
              <option>Reading + practice</option>
              <option>Hands-on projects</option>
              <option>Mixed approach</option>
            </select>
          </label>
        </div>
        <button className="gradient-button" type="submit" disabled={isGenerating}>
          {isGenerating ? 'Analyzing mission...' : 'Analyze mission and propose actions'}
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </div>
  );
};

export default OnboardingPage;
