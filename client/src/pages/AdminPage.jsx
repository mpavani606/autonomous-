import { useEffect, useState } from 'react';
import { BrainCircuit, ClipboardCheck, Rocket, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../services/api';

const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    Promise.all([api.get('/admin/stats'), api.get('/admin/admins')])
      .then(([statsResponse, adminsResponse]) => {
        setStats(statsResponse.data.data);
        setAdmins(adminsResponse.data.data);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Could not load administrator dashboard data.');
      });
  }, [user?.role]);

  const createAdministrator = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/admin/admins', form);
      setAdmins((current) => [...current, data.data]);
      setForm({ name: '', email: '', password: '' });
      try {
        const statsResponse = await api.get('/admin/stats');
        setStats(statsResponse.data.data);
      } catch (refreshError) {
        console.error('Administrator created, but admin dashboard totals could not be refreshed.', refreshError);
        setError('Administrator account created, but dashboard totals could not refresh. Reload the page to update them.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create the administrator account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="page-shell">
        <div className="glass-card form-card">
          <h2>Admin access required</h2>
          <p>Your account does not have permission to view system monitoring data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin dashboard</span>
          <h2>System overview</h2>
          <p>Live totals from saved application records. Learner-submitted scores are not independently verified.</p>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!stats && !error && <p role="status">Loading admin monitoring data...</p>}
      {stats && (
        <>
          <div className="stats-grid">
            <StatCard icon={<Rocket size={18} />} label="Student accounts" value={stats.totalStudents.toLocaleString()} subValue="Registered learners" />
            <StatCard icon={<Shield size={18} />} label="Administrators" value={stats.totalAdmins.toLocaleString()} subValue="Admin-role accounts" />
            <StatCard icon={<Sparkles size={18} />} label="Study plans" value={stats.aiPlansGenerated.toLocaleString()} subValue="Saved plans" />
            <StatCard icon={<ClipboardCheck size={18} />} label="Study sessions" value={stats.studySessions.toLocaleString()} subValue="Saved sessions" />
            <StatCard icon={<BrainCircuit size={18} />} label="Learner feedback" value={stats.selfReportedAssessments.toLocaleString()} subValue={stats.averageSelfReportedScore === null ? 'No scores submitted yet' : `Average self-reported score: ${stats.averageSelfReportedScore}%`} />
          </div>
          <section className="glass-card admin-management">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Administrator access</span>
                <h3>Create another administrator</h3>
              </div>
            </div>
            <p>Only a signed-in administrator can create additional admin accounts.</p>
            <form className="admin-create-form" onSubmit={createAdministrator}>
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" aria-label="New administrator full name" />
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" aria-label="New administrator email" />
              <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password (at least 8 characters)" aria-label="New administrator password" />
              <button className="gradient-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create administrator'}</button>
            </form>
            <h3>Administrator accounts</h3>
            {admins.length === 0 ? <p>No administrator accounts were found.</p> : (
              <div className="admin-list">
                {admins.map((admin) => (
                  <div className="task-item" key={admin.id || admin._id}>
                    <div><strong>{admin.name}</strong><span>{admin.email}</span></div>
                    <small>{new Date(admin.createdAt).toLocaleDateString()}</small>
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

export default AdminPage;
