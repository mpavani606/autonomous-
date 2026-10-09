import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export const useProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/progress');
        setProgress(data.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load progress signals. Please check the server connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(
    () => ({
      mastery: progress?.overallMastery ?? null,
      accuracy: progress?.accuracy ?? null,
      completionRate: progress?.completionRate ?? null,
      studyHours: progress?.studyHours ?? null,
    }),
    [progress]
  );

  return { progress, loading, error, summary };
};
