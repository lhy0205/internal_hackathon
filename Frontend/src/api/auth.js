import { api } from './client';

export function fetchMe() {
  return api.get('/auth/me');
}

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /KAKAOTALK|Instagram|FBAN|FBIOS|FB_IAB|Line|Twitter|Snapchat|NaverApp/i.test(ua)
    || (/wv|WebView/i.test(ua) && /Android|iPhone/i.test(ua));
}

function showExternalBrowserModal(siteUrl) {
  const existing = document.getElementById('__iab-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = '__iab-modal';
  overlay.style.cssText = [
    'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88)',
    'display:flex;align-items:center;justify-content:center;padding:20px',
  ].join(';');

  overlay.innerHTML = `
    <div style="background:#0d0d1a;border:2px solid #00ffff;border-radius:16px;padding:24px;max-width:340px;width:100%;text-align:center;font-family:sans-serif">
      <p style="color:#00ffff;font-size:11px;letter-spacing:2px;margin:0 0 8px">앱 내부 브라우저 감지</p>
      <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 10px">구글 로그인은 Chrome / Safari에서만 가능합니다</p>
      <p style="color:#aaa;font-size:12px;margin:0 0 16px">아래 주소를 복사하여 브라우저에서 열어주세요</p>
      <input id="__iab-url" readonly value="${siteUrl}"
        style="width:100%;padding:8px;border-radius:8px;border:1px solid #333;background:#060614;color:#00ffff;font-size:11px;box-sizing:border-box;margin-bottom:12px"
        onclick="this.select()" />
      <button id="__iab-copy"
        style="width:100%;padding:11px;border-radius:8px;border:none;background:#00ffff;color:#000;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:8px">
        URL 복사
      </button>
      <button id="__iab-close"
        style="width:100%;padding:9px;border-radius:8px;border:1px solid #333;background:transparent;color:#888;font-size:12px;cursor:pointer">
        닫기
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('__iab-copy').onclick = () => {
    const btn = document.getElementById('__iab-copy');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(siteUrl).then(() => { btn.textContent = '복사 완료 ✓'; });
    } else {
      const input = document.getElementById('__iab-url');
      input.select();
      document.execCommand('copy');
      btn.textContent = '복사 완료 ✓';
    }
  };
  document.getElementById('__iab-close').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

export function loginWithGoogle() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const BACKEND_URL = API_URL.replace(/\/api$/, '');

  if (!isInAppBrowser()) {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
    return;
  }

  const siteUrl = window.location.href;
  const ua = navigator.userAgent || '';

  if (/Android/i.test(ua)) {
    // Android: intent URL → Chrome으로 강제 오픈
    const { host, pathname, search } = window.location;
    window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
  } else {
    // iOS: x-safari scheme 시도 후 URL 복사 모달
    try { window.location.href = `x-safari-${siteUrl}`; } catch {}
    setTimeout(() => showExternalBrowserModal(siteUrl), 400);
  }
}

export function logout() {
  localStorage.removeItem('access_token');
  return api.post('/auth/logout');
}
