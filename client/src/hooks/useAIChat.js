import { useCallback, useRef, useState } from 'react';
import api from '../services/api';

export const useAIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I can explain concepts and help you review proposed mission actions. I will tell you when I only have representative demo signals.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const sendMessage = useCallback(async (question, context) => {
    if (!question.trim()) return;

    setMessages((current) => [...current, { role: 'user', content: question }]);
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/ask', { question: question.trim(), context });
      setMessages((current) => [...current, {
        role: 'assistant',
        content: data.data.answer,
        mode: data.data.mode,
      }]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The mentor could not answer because the server is unavailable. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  return { messages, loading, error, inputRef, sendMessage };
};
