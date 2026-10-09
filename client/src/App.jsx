import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import AIMentorPage from './pages/AIMentorPage';
import AINotesPage from './pages/AINotesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DashboardPage from './pages/DashboardPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PracticePage from './pages/PracticePage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import StudyPlanPage from './pages/StudyPlanPage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><AppLayout><OnboardingPage /></AppLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><AppLayout><StudyPlanPage /></AppLayout></ProtectedRoute>} />
        <Route path="/graph" element={<ProtectedRoute><AppLayout><KnowledgeGraphPage /></AppLayout></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><AppLayout><AINotesPage /></AppLayout></ProtectedRoute>} />
        <Route path="/mentor" element={<ProtectedRoute><AppLayout><AIMentorPage /></AppLayout></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><AppLayout><PracticePage /></AppLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminPage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
