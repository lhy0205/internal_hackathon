import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'summon', label: '변명 소환소', path: '/quest-select' },
  { id: 'library', label: '변명 도감', path: '/library' },
  { id: 'battle', label: '디펜스 훈련소', path: '/battle' },
  { id: 'my', label: '마이페이지', path: '/my' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/' || path.includes('quest') || path.includes('skill') || path.includes('summon')) return 'summon';
    if (path.includes('library') || path.includes('share')) return 'library';
    if (path.includes('battle') || path.includes('victory')) return 'battle';
    if (path.includes('my')) return 'my';
    return '';
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <span className="sidebar__logo-kr">변명</span>
        <span className="sidebar__logo-en">RPG</span>
      </div>
      <div className="sidebar__tagline">GUILD OF EXCUSES</div>

      {/* Profile */}
      <div className="sidebar__profile">
        <div className="sidebar__avatar">
          <svg viewBox="0 0 24 24">
            <path d="M3 13l9-9 9 9" />
            <path d="M5 11v8h14v-8" />
          </svg>
        </div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">Lv.7 {user?.nickname ?? '탈주러'}</div>
          <div className="sidebar__user-title">칭호: 단골 불참자</div>
          <div className="sidebar__user-xp">
            <div className="sidebar__user-xp-fill" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${getActiveId() === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar__nav-dot" />
            <span className="sidebar__nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Coin */}
      <div className="sidebar__coin">
        <span className="sidebar__coin-icon">C</span>
        <div className="sidebar__coin-info">
          <span className="sidebar__coin-label">보유 코인</span>
          <span className="sidebar__coin-amount">1,240 G</span>
        </div>
      </div>
    </aside>
  );
}
