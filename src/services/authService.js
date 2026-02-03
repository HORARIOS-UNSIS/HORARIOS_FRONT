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
    
    // Extraer datos, manejando posibles variantes de nombre de propiedades
    const data = response.data;
    const token = data.token;
    // El backend puede devolver 'role' o 'rol'
    const role = data.role || data.rol; 
    const idUsuario = data.idUsuario || data.id;
    const user = data.username || data.nombreUsuario || username;
    
    // Guardar token y datos de usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id: idUsuario,
      username: user,
      role: role,
      ...data // Guardar el resto de los datos por si acaso
    }));
    
    return {
      success: true,
      token,
      user: {
        id: idUsuario,
        username: user,
        role: role,
        ...data
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
