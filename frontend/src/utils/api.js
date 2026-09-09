// frontend/src/utils/api.js

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('admin_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Si el token expiró o es inválido, cerrar sesión
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    throw new Error('No autorizado');
  }

  return response;
};
