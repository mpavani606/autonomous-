import { useEffect, useState } from 'react';
import api from '../services/api';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const { data } = await api.get('/notes');
        if (isCurrent) setNotes(data.data || []);
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load your notes. Please check the server connection and try again.');
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };
    load();
  }, []);

  const addNote = async ({ title, content }) => {
    const { data } = await api.post('/notes', { title, content });
    setNotes((currentNotes) => [data.data, ...currentNotes]);
    setError('');
  };

  return { notes, loading, error, addNote };
};
