import { api } from './client';

export function fetchMe() {
  return api.get('/auth/me');
}

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /KAKAOTALK|Instagram|FBAN|FBIOS|FB_IAB|Line|Twitter|Snapchat|NaverApp/i.test(ua)
    || (/wv|WebView/i.test(ua) && /Android|iPhone/i.test(ua));
}

export function loginWithGoogle() {
  if (isInAppBrowser()) {
    alert('카카오톡·인스타 등 앱 내부 브라우저에서는 구글 로그인이 지원되지 않습니다.\n\nChrome 또는 Safari에서 열어주세요.\n(우측 상단 ··· → 기본 브라우저로 열기)');
    return;
  }
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const BACKEND_URL = API_URL.replace(/\/api$/, '');
  window.location.href = `${BACKEND_URL}/auth/google/login`;
}

export function logout() {
  localStorage.removeItem('access_token');
  return api.post('/auth/logout');
}
