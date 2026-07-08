import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    id: 'home',
    label: '홈',
    path: '/',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 12L12 3l9 9M5 10v9h4v-5h6v5h4v-9" />
      </svg>
    ),
  },
  {
    id: 'summon',
    label: '뽑기',
    path: '/quest-select',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="6" width="14" height="18" rx="2" />
        <path d="M9 11h6M9 15h6" />
      </svg>
    ),
  },
  {
    id: 'library',
    label: '도감',
    path: '/library',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 6v18M4 8q8-3 8 0v16q0-3-8 0z" />
        <path d="M20 8q-8-3-8 0" />
      </svg>
    ),
  },
  {
    id: 'battle',
    label: '전투',
    path: '/battle',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M8 20l12-14M17 4l4-1-1 4M7 19l3 3" />
      </svg>
    ),
  },
  {
    id: 'my',
    label: '마이',
    path: '/my',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 22q0-8 7-8 7 0 7 8" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.includes('quest') || path.includes('skill') || path.includes('summon')) return 'summon';
    if (path.includes('library')) return 'library';
    if (path.includes('battle') || path.includes('victory')) return 'battle';
    if (path.includes('my')) return 'my';
    return '';
  };

  const activeId = getActiveId();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav__item ${activeId === item.id ? 'bottom-nav__item--active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
