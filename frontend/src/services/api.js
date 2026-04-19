import axios from 'axios';

const api = axios.create({
  baseURL: "https://usr-geneva-absorption-casual.trycloudflare.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('k9_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
