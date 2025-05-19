import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Set up axios defaults
axios.defaults.baseURL = API_URL;

// Add a request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors by logging out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  register: (userData) => axios.post('/api/users', userData),
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return axios.post('/api/users/login', formData);
  },
  getProfile: () => axios.get('/api/users/me'),
  updateProfile: (userData) => axios.put('/api/users/me', userData),
};

export const sessionApi = {
  getMySessions: () => axios.get('/api/sessions/my'),
  getSession: (sessionId) => axios.get(`/api/sessions/${sessionId}`),
  createSession: (sessionData) => axios.post('/api/sessions', sessionData),
  updateSession: (sessionId, sessionData) => axios.put(`/api/sessions/${sessionId}`, sessionData),
  cancelSession: (sessionId, reason) => axios.post(`/api/sessions/${sessionId}/cancel`, { reason }),
  getSessionInteractions: (sessionId) => axios.get(`/api/counseling/interactions/${sessionId}`),
  sendMessage: (sessionId, message) => axios.post('/api/counseling/interact', { 
    session_id: sessionId, 
    question: message 
  }),
  endSession: (sessionId) => axios.post(`/api/counseling/end-session/${sessionId}`),
};

export const psychometricApi = {
  uploadReport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/api/reports/psychometric', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  generateRoadmap: () => axios.post('/api/reports/roadmap'),
  getRoadmaps: () => axios.get('/api/reports/roadmaps'),
};

export default {
  userApi,
  sessionApi,
  psychometricApi,
};
