import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyPlannerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isPublicAuthRequest = /^\/auth\/(login|register)(?:\?|$)/.test(requestUrl);
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      localStorage.removeItem('studyPlannerToken');
      localStorage.removeItem('studyPlannerUser');
      window.dispatchEvent(new Event('studyPlannerSessionExpired'));
    }
    return Promise.reject(error);
  }
);

export default api;
