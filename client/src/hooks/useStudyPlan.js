import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const storageKeyFor = (user) => `studyPlannerPlan:${user?.id || user?.email || 'learner'}`;

const readSavedPlan = (storageKey) => {
  try {
    const savedPlan = localStorage.getItem(storageKey);
    return savedPlan ? JSON.parse(savedPlan) : null;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const saveStudyPlan = (plan, user) => {
  localStorage.setItem(storageKeyFor(user), JSON.stringify(plan));
  window.dispatchEvent(new Event('studyPlannerPlanUpdated'));
};

export const useStudyPlan = () => {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user);
  const [savedPlan, setSavedPlan] = useState(() => ({
    storageKey,
    plan: readSavedPlan(storageKey),
  }));
  const plan = savedPlan.storageKey === storageKey
    ? savedPlan.plan
    : readSavedPlan(storageKey);
  const [loadStatus, setLoadStatus] = useState(() => ({
    storageKey,
    loading: true,
    error: '',
  }));
  const loading = loadStatus.storageKey !== storageKey || loadStatus.loading;
  const error = loadStatus.storageKey === storageKey ? loadStatus.error : '';

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const { data } = await api.get('/study-plans');
        const savedPlan = Array.isArray(data.data) ? data.data[0] || null : data.data || null;
        if (!isCurrent) return;
        setSavedPlan({ storageKey, plan: savedPlan });
        if (savedPlan) {
          localStorage.setItem(storageKey, JSON.stringify(savedPlan));
        } else {
          localStorage.removeItem(storageKey);
        }
        setLoadStatus({ storageKey, loading: false, error: '' });
      } catch (requestError) {
        if (isCurrent) {
          setLoadStatus({
            storageKey,
            loading: false,
            error: requestError.response?.data?.message || 'Could not load your mission plan. Please check the server connection and try again.',
          });
        }
      }
    };
    load();
    return () => {
      isCurrent = false;
    };
  }, [storageKey]);

  useEffect(() => {
    const refreshPlan = () => setSavedPlan({ storageKey, plan: readSavedPlan(storageKey) });
    window.addEventListener('studyPlannerPlanUpdated', refreshPlan);
    return () => window.removeEventListener('studyPlannerPlanUpdated', refreshPlan);
  }, [storageKey]);

  return { plan, loading, error };
};
