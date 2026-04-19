import axios from 'axios';

// En Render, VITE_API_URL debe ser algo como https://k9-backend.onrender.com/api
// En local, será http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// BASE_URL es la raíz del servidor (sin /api) para las imágenes
export const BASE_URL = API_URL.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('k9_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
