import { api } from './client';

export function fetchMe() {
  return api.get('/auth/me');
}

export function loginWithGoogle() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const BACKEND_URL = API_URL.replace(/\/api$/, '');
  window.location.href = `${BACKEND_URL}/auth/google/login`;
}

export function logout() {
  return api.post('/auth/logout');
}
