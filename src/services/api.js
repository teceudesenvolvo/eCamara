import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://camara-ai-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@CamaraAI:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros globais (como 401 ou 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Se o status for 401, o token expirou ou é inválido
      if (error.response.status === 401) {
        localStorage.removeItem('@CamaraAI:token');
        localStorage.removeItem('@CamaraAI:user');
        // window.location.href = '/'; // Opcional: Redirecionar para o login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
