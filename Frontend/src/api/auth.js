import { api } from './client';

// 현재 로그인된 유저 정보 조회 (앱 시작 시 호출)
export function fetchMe() {
  return api.get('/auth/me');
}

// 구글 OAuth 로그인 (백엔드 리다이렉트 방식)
export function loginWithGoogle() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const BACKEND_URL = API_URL.replace(/\/api$/, '');
  window.location.href = `${BACKEND_URL}/auth/google/login`;
}

// 로그아웃
export function logout() {
  return api.post('/auth/logout');
}
