import { useEffect, useState } from 'react';
import api from '../services/api';

export const useKnowledgeGraph = () => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/knowledge-graph/graph');
        setGraph(data.data || { nodes: [], edges: [] });
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load the knowledge graph. Please check the server connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { graph, loading, error };
};
