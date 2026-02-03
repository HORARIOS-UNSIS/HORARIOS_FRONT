import axios from 'axios';

// Configurar la URL base del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088/api';

// Crear instancia de axios con configuración
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT a las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la configuración de la petición tiene skipAuthRedirect, no redirigir
    if (error.response?.status === 401 && !error.config.skipAuthRedirect) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
