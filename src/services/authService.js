import apiClient from './apiClient';

/**
 * Servicio de Autenticación
 * Consume endpoints de /api/auth desde el backend
 */

export async function loginUser(username, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password
    });
    
    const { token, role, idUsuario, username: user } = response.data;
    
    // Guardar token y datos de usuario
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id: idUsuario,
      username: user,
      role: role
    }));
    
    return {
      success: true,
      token,
      user: {
        id: idUsuario,
        username: user,
        role: role
      }
    };
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al iniciar sesión'
    };
  }
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}
