import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import ProgressBar from '../components/common/ProgressBar';
import Hearts from '../components/common/Hearts';
import CoinBadge from '../components/common/CoinBadge';
import { fetchUserProfile, fetchUserStats, fetchAchievements, fetchHistory } from '../api/user';
import '../styles/mypage.css';

const DEFAULT_USER = {
  name: '탈주러',
  level: 7,
  title: '단골 불참자',
  xp: 320,
  xpMax: 500,
  coins: 1240,
  mp: 86,
};

const DEFAULT_STATS = [
  { value: '14', label: '수집 변명', color: 'var(--lime)' },
  { value: '23', label: '배틀 승리', color: 'var(--cyan)' },
  { value: '7', label: '연속 탈출', color: 'var(--pink)' },
];

const DEFAULT_ACHIEVEMENTS = [
  { icon: '🏃', name: '첫 번째 탈출', desc: '변명 1회 소환 성공', done: true },
  { icon: '🔥', name: '연속 3콤보', desc: '배틀에서 3턴 연속 성공', done: true },
  { icon: '👑', name: 'S랭크 수집가', desc: 'S랭크 변명 5개 수집', done: false },
  { icon: '🎭', name: '변명의 달인', desc: '전 카테고리 변명 보유', done: false },
];

const DEFAULT_HISTORY = [
  { rank: 'S', rankColor: 'var(--gold)', text: '노트북이 먹통이라 파일을 못 여는…', date: '06/22' },
  { rank: 'A', rankColor: 'var(--purple)', text: '야근이 터져서 오늘은 아무것도…', date: '06/19' },
  { rank: 'F', rankColor: 'var(--red)', text: '갑자기 몸이 기어이 올라와서…', date: '06/18' },
  { rank: 'B', rankColor: 'var(--cyan)', text: '주말 출근 잡혀서 못 내려가', date: '06/15' },
];

const MENU_ITEMS = [
  '칭호 변경',
  '알림 설정',
  '이용약관',
  '로그아웃',
];

function ProfileCard({ user }) {
  return (
    <div className="mypage__profile">
      <div className="mypage__avatar">
        <svg viewBox="0 0 24 24">
          <path d="M3 13l9-9 9 9" />
          <path d="M5 11v8h14v-8" />
        </svg>
        <span className="mypage__avatar-badge">Lv.{user.level}</span>
      </div>
      <div className="mypage__user">
        <div className="mypage__user-name">{user.name}</div>
        <div className="mypage__user-title">칭호: {user.title}</div>
        <div className="mypage__xp-row">
          <span className="mypage__xp-label">XP</span>
          <div className="mypage__xp-bar">
            <ProgressBar value={user.xp} max={user.xpMax} color="lime" height={7} />
          </div>
          <span className="mypage__xp-value">{user.xp}/{user.xpMax}</span>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats }) {
  return (
    <div className="mypage__stats">
      {stats.map((s) => (
        <div className="mypage__stat" key={s.label}>
          <span className="mypage__stat-value" style={{ color: s.color }}>{s.value}</span>
          <span className="mypage__stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function Inventory({ user }) {
  return (
    <div className="mypage__inventory">
      <div className="mypage__inventory-header">INVENTORY</div>
      <div className="mypage__inventory-body">
        <div className="mypage__inventory-row">
          <div className="mypage__inventory-item">
            <div className="mypage__inventory-icon" style={{ background: 'var(--gold)' }}>C</div>
            <span className="mypage__inventory-name">보유 코인</span>
          </div>
          <span className="mypage__inventory-value" style={{ color: 'var(--gold)' }}>{user.coins.toLocaleString()} G</span>
        </div>
        <div className="mypage__inventory-row">
          <div className="mypage__inventory-item">
            <div className="mypage__inventory-icon" style={{ background: 'var(--cyan)' }}>M</div>
            <span className="mypage__inventory-name">마나 (MP)</span>
          </div>
          <span className="mypage__inventory-value" style={{ color: 'var(--cyan)' }}>{user.mp} / 100</span>
        </div>
        <div className="mypage__inventory-row">
          <div className="mypage__inventory-item">
            <div className="mypage__inventory-icon" style={{ background: 'var(--pink)' }}>♥</div>
            <span className="mypage__inventory-name">하트</span>
          </div>
          <span className="mypage__inventory-value" style={{ color: 'var(--pink)' }}>2 / 3</span>
        </div>
      </div>
    </div>
  );
}

function AchievementList({ achievements }) {
  return (
    <>
      <h2 className="mypage__section-title">ACHIEVEMENTS</h2>
      <div className="mypage__achievements">
        {achievements.map((a) => (
          <div key={a.name} className={`mypage__achievement ${a.done ? 'mypage__achievement--done' : ''}`}>
            <div className="mypage__achievement-icon" style={{ background: a.done ? 'var(--green-dark)' : 'var(--bg-tertiary)' }}>
              {a.icon}
            </div>
            <div className="mypage__achievement-info">
              <div className="mypage__achievement-name">{a.name}</div>
              <div className="mypage__achievement-desc">{a.desc}</div>
            </div>
            <span className="mypage__achievement-check" style={{ color: a.done ? 'var(--green)' : 'var(--border)' }}>
              {a.done ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function RecentHistory({ history }) {
  return (
    <>
      <h2 className="mypage__section-title">RECENT LOG</h2>
      <div className="mypage__history">
        {history.map((h, i) => (
          <div key={i} className="mypage__history-item">
            <span className="mypage__history-rank" style={{ color: h.rankColor }}>{h.rank}</span>
            <span className="mypage__history-text">{h.text}</span>
            <span className="mypage__history-date">{h.date}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function MenuList() {
  return (
    <div className="mypage__menu">
      {MENU_ITEMS.map((item) => (
        <button key={item} className="mypage__menu-item">
          <span>{item}</span>
          <span className="mypage__menu-arrow">›</span>
        </button>
      ))}
    </div>
  );
}

export default function MyPage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(DEFAULT_USER);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);
  const [history, setHistory] = useState(DEFAULT_HISTORY);

  useEffect(() => {
    fetchUserProfile()
      .then(profile => setUser(prev => ({ ...prev, ...profile, name: authUser?.nickname || profile.name })))
      .catch(() => {
        if (authUser?.nickname) setUser(prev => ({ ...prev, name: authUser.nickname }));
      });
    fetchUserStats().then(setStats).catch(() => {});
    fetchAchievements().then(setAchievements).catch(() => {});
    fetchHistory().then(setHistory).catch(() => {});
  }, []);

  return (
    <PageLayout title="마이페이지" subtitle={`PROFILE · ${user.name}의 전적을 확인하라`}>
      {/* Mobile */}
      <div className="mypage scanlines mobile-only">
        <div className="quest-select__header" style={{ marginBottom: 16 }}>
          <Hearts filled={2} total={3} />
          <CoinBadge amount={user.coins} />
        </div>
        <h1 className="mypage__title">마이페이지</h1>
        <ProfileCard user={user} />
        <StatsGrid stats={stats} />
        <Inventory user={user} />
        <AchievementList achievements={achievements} />
        <RecentHistory history={history} />
        <MenuList />
        <BottomNav />
      </div>

      {/* Desktop: 2-column */}
      <div className="mypage__desktop-grid desktop-only">
        <div className="mypage__left-col">
          <ProfileCard user={user} />
          <StatsGrid stats={stats} />
          <Inventory user={user} />
          <MenuList />
        </div>
        <div className="mypage__right-col">
          <AchievementList achievements={achievements} />
          <RecentHistory history={history} />
        </div>
      </div>
    </PageLayout>
  );
}
