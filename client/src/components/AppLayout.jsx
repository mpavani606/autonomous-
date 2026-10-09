import { NavLink } from 'react-router-dom';
import {
  BookOpenCheck,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Goal,
  LayoutDashboard,
  LogOut,
  Network,
  NotebookPen,
  Shield,
  UserRound,
  MessagesSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['student'] },
  { to: '/plan', label: 'Mission Plan', Icon: ClipboardList, roles: ['student'] },
  { to: '/graph', label: 'Knowledge Map', Icon: Network, roles: ['student'] },
  { to: '/notes', label: 'Agent Notes', Icon: NotebookPen, roles: ['student'] },
  { to: '/mentor', label: 'AI Mentor', Icon: MessagesSquare, roles: ['student'] },
  { to: '/practice', label: 'Practice', Icon: BookOpenCheck, roles: ['student'] },
  { to: '/analytics', label: 'Analytics', Icon: ChartNoAxesColumnIncreasing, roles: ['student'] },
  { to: '/onboarding', label: 'Learning Goal', Icon: Goal, roles: ['student'] },
  { to: '/profile', label: 'Profile', Icon: UserRound, roles: ['student'] },
  { to: '/admin/dashboard', label: 'Admin Dashboard', Icon: Shield, roles: ['admin'] },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar glass-card">
        <div className="brand-row">
          <div className="brand-icon">A</div>
          <div>
            <strong>Autonomous Study Planner</strong>
            <small>Autonomous learning agent</small>
          </div>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          {navigation.filter((item) => item.roles.includes(user?.role)).map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.Icon size={18} aria-hidden="true" />
              <span>{item.adminDashboard && user?.role === 'admin' ? 'Admin Dashboard' : item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="mini-profile">
            <div className="avatar">{user?.name?.[0] || 'J'}</div>
            <div>
              <strong>{user?.name || 'Janaki'}</strong>
              <small>{user?.role || 'student'}</small>
            </div>
          </div>
          <button className="ghost-button" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">{children}</main>
    </div>
  );
};

export default AppLayout;
