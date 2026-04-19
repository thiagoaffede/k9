import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:5000/api',
  baseURL: "https://voice-buck-storage-headed.trycloudflare.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('k9_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
