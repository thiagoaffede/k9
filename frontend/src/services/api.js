import axios from 'axios';

// Obtenemos la URL de Render o localhost
let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Limpieza: Si la URL viene de Render (property: host) y no tiene protocolo
if (API_URL && !API_URL.startsWith('http')) {
  API_URL = `https://${API_URL}`;
}

// Limpieza: Aseguramos que termine en /api para que las rutas funcionen
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/$/, "") + "/api";
}

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

// Si el token venció, no dejamos al usuario en una pantalla "logueada" que
// falla en silencio en cada formulario: limpiamos la sesión y volvemos al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('k9_token');
      localStorage.removeItem('k9_user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
