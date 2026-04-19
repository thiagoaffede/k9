import axios from 'axios';

const api = axios.create({
  baseURL: "https://k9-emmo.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('k9_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
