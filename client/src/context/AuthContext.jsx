import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('studyPlannerUser') || 'null');
  } catch {
    localStorage.removeItem('studyPlannerUser');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('studyPlannerToken') || '');
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(localStorage.getItem('studyPlannerToken')));

  const login = useCallback((nextUser, nextToken) => {
    setIsCheckingSession(true);
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('studyPlannerUser', JSON.stringify(nextUser));
    localStorage.setItem('studyPlannerToken', nextToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken('');
    setIsCheckingSession(false);
    localStorage.removeItem('studyPlannerUser');
    localStorage.removeItem('studyPlannerToken');
  }, []);

  useEffect(() => {
    window.addEventListener('studyPlannerSessionExpired', logout);
    return () => window.removeEventListener('studyPlannerSessionExpired', logout);
  }, [logout]);

  useEffect(() => {
    if (!token) return;

    let isCurrent = true;
    api.get('/auth/me')
      .then(({ data }) => {
        if (!isCurrent) return;
        setUser(data.user);
        localStorage.setItem('studyPlannerUser', JSON.stringify(data.user));
      })
      .catch((error) => {
        if (!isCurrent) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        } else {
          console.error('Could not validate the saved authentication session.', error);
        }
      })
      .finally(() => {
        if (isCurrent) setIsCheckingSession(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isCheckingSession,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, isCheckingSession, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
