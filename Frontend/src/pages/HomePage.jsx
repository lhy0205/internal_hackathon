import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../api/auth';
import '../styles/home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  return (
    <div className="home scanlines">
      <div className="ambient-blob ambient-blob--purple" style={{ width: 240, height: 240, top: -40, left: -60 }} />
      <div className="ambient-blob ambient-blob--cyan" style={{ width: 280, height: 280, bottom: -40, right: -60 }} />

      <div className="home__subtitle">GUILD OF<br />EXCUSES</div>
      <div className="home__title">
        <span className="home__title-kr">변명</span>
        <span className="home__title-en">RPG</span>
      </div>

      <p className="home__tagline">갈겠... (못갔)</p>
      <p className="home__desc">변명을 뽑고, 등급을 받고, 디펜스로 살아남아라</p>

      <div className="home__gem">
        <div className="home__gem-shape">
          <svg viewBox="0 0 92 116" fill="none">
            <polygon points="46,0 92,58 46,116 0,58" fill="#2a2440" stroke="#22d3ee" strokeWidth="2" />
            <polygon points="46,0 92,58 46,58 0,58" fill="#a855f7" fillOpacity="0.35" />
            <polygon points="46,116 92,58 46,58 0,58" fill="#f43f8e" fillOpacity="0.25" />
            <text x="46" y="66" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="40" fill="#f4f1ff">?</text>
          </svg>
        </div>
        <div className="home__gem-circle" />
      </div>

      <button className="btn-primary home__start-btn" onClick={() => navigate('/quest-select')}>
        ▶ 게임 시작
      </button>

      {!loading && (
        user ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <p className="home__login-hint">
              {user.nickname} 님 · 도감 저장 활성화
            </p>
            <button
              onClick={logout}
              style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                fontSize: 10, padding: '4px 12px', borderRadius: 6, cursor: 'pointer'
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <p className="home__login-hint">비회원 플레이 가능 · 도감 저장은 로그인</p>
            <button
              onClick={loginWithGoogle}
              style={{
                background: 'none', border: '1px solid var(--cyan)',
                color: 'var(--cyan)', fontFamily: 'var(--font-mono)',
                fontSize: 10, padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              Google 로그인
            </button>
          </div>
        )
      )}

      <p className="home__press-start">PRESS START</p>
    </div>
  );
}
