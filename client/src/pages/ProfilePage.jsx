import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Profile</span>
          <h2>Student profile</h2>
        </div>
      </div>
      <div className="glass-card form-card profile-card">
        <div className="profile-circle">{user?.name?.[0] || 'J'}</div>
        <div className="profile-fields">
          <p><strong>Name:</strong> {user?.name || 'Janaki'}</p>
          <p><strong>Email:</strong> {user?.email || 'janaki@student.ai'}</p>
          <p><strong>Role:</strong> {user?.role || 'student'}</p>
          <p><strong>Study style:</strong> Visual + Practice</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
