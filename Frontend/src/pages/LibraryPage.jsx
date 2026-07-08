import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import ProgressBar from '../components/common/ProgressBar';
import StarRating from '../components/common/StarRating';
import Hearts from '../components/common/Hearts';
import CoinBadge from '../components/common/CoinBadge';
import { fetchLibrary, fetchLibraryStats, fetchLibraryItem, fetchBattleLibrary } from '../api/library';
import '../styles/library.css';

const FILTERS = [
  { label: '전체' }, { label: '약속' }, { label: '과제·팀플' },
  { label: '회식·모임' }, { label: '야근' }, { label: '가족 행사' },
];

const RANK_COLORS = { F: 'var(--red)', A: 'var(--purple)', S: 'var(--gold)', B: 'var(--cyan)', C: 'var(--lime)' };
const RANK_LABELS = { F: '다컬 파문', A: '명작', S: '전설', B: '양작', C: '범작' };

function CardDetailModal({ itemId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLibraryItem(itemId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [itemId]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-primary)', borderRadius: 16, width: '100%', maxWidth: 400, border: detail ? `2px solid var(--${detail.rankColor})` : '2px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--cyan)' }}>LOADING...</div>
        ) : !detail ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>불러오기 실패</div>
        ) : (
          <>
            <div className={`excuse-card__rank-bar excuse-card__rank-bar--${detail.rank}`}>{detail.rank} RANK · {RANK_LABELS[detail.rank] || detail.rank}</div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <StarRating filled={detail.stars} total={5} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>{detail.category}</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>"{detail.text}"</p>
              </div>
              {detail.reaction && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--purple)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>적 반응</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{detail.reaction}</span>
                </div>
              )}
              {detail.tip && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>퀘스트팁</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{detail.tip}</span>
                </div>
              )}
              {detail.savedAt && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', textAlign: 'right' }}>저장일 {detail.savedAt}</p>}
              <button
                className="btn-primary btn-primary--red"
                style={{ width: '100%', marginTop: 16, fontSize: 12 }}
                onClick={() => navigate('/battle', { state: { excuseText: detail.text } })}
              >
                ▶ 이 변명으로 배틀
              </button>
              <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer' }}>닫기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ item, onClick }) {
  if (!item.text) {
    return (
      <div className="lib-card lib-card--locked">
        <div className="lib-card__header lib-card__header--locked"><span>LOCKED</span><span className="lib-card__rank">?</span></div>
        <div className="lib-card__body"><span className="lib-card__lock-icon">?</span></div>
      </div>
    );
  }
  return (
    <div className="lib-card" style={{ borderWidth: 2, borderStyle: 'solid', borderColor: `var(--${item.rankColor})`, cursor: 'pointer' }} onClick={onClick}>
      <div className={`lib-card__header lib-card__header--${item.rankColor}`}>
        <span>{item.category || '-'}</span><span className="lib-card__rank">{item.rank}</span>
      </div>
      <div className="lib-card__body">
        <div className="lib-card__stars"><StarRating filled={item.stars} total={5} size={10} /></div>
        <p className="lib-card__text">"{item.text}"</p>
      </div>
    </div>
  );
}

function BattleCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="lib-card"
      style={{ borderWidth: 2, borderStyle: 'solid', borderColor: item.success ? 'var(--cyan)' : 'var(--red)', cursor: 'pointer' }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="lib-card__header" style={{ background: item.success ? 'var(--cyan)' : 'var(--red)', color: '#000' }}>
        <span style={{ fontSize: 10 }}>{item.savedAt}</span>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 10 }}>{item.success ? 'WIN' : 'LOSE'}</span>
      </div>
      <div className="lib-card__body" style={{ gap: 6 }}>
        <p className="lib-card__text">"{item.excuseText}"</p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
          의심도 {item.suspicion}% · {item.turns}턴
        </div>
        {item.defenseType && (
          <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 6, borderLeft: '3px solid var(--cyan)' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--cyan)', marginBottom: 2 }}>디펜스 유형</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{item.defenseType}</div>
            {open && item.defenseTypeReason && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{item.defenseTypeReason}</p>
            )}
            {item.defenseTypeReason && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', marginTop: 4 }}>
                {open ? '▲ 접기' : '▼ 이유 보기'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [tab, setTab] = useState('excuse');
  const [activeFilter, setActiveFilter] = useState('전체');
  const [items, setItems] = useState([]);
  const [battleItems, setBattleItems] = useState([]);
  const [stats, setStats] = useState({ collected: 0, total: 60 });
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchLibrary(activeFilter)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
    fetchLibraryStats().then(setStats).catch(() => {});
    fetchBattleLibrary()
      .then((data) => setBattleItems(data.items))
      .catch(() => setBattleItems([]));
  }, [activeFilter]);

  const excuseGrid = (desktop = false) => (
    <div className={`library__grid ${desktop ? 'library__grid--desktop' : ''}`}>
      {items.map((item) => (
        <LibraryCard key={item.id} item={item} onClick={() => item.text && setSelectedId(item.id)} />
      ))}
      {items.length === 0 && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', padding: 24 }}>
          저장된 변명이 없습니다
        </p>
      )}
    </div>
  );

  const battleGrid = (desktop = false) => (
    <div className={`library__grid ${desktop ? 'library__grid--desktop' : ''}`}>
      {battleItems.map((item) => (
        <BattleCard key={item.id} item={item} />
      ))}
      {battleItems.length === 0 && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', padding: 24 }}>
          배틀 기록이 없습니다
        </p>
      )}
    </div>
  );

  const tabBar = (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {[{ key: 'excuse', label: '변명 도감' }, { key: 'battle', label: '디펜스 도감' }].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          style={{
            fontFamily: 'var(--font-pixel)', fontSize: 10, padding: '6px 14px',
            borderRadius: 6, cursor: 'pointer', border: 'none',
            background: tab === key ? 'var(--cyan)' : 'var(--bg-secondary)',
            color: tab === key ? '#000' : 'var(--text-secondary)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <PageLayout title="변명 도감" subtitle="COLLECTION · 수집한 변명과 배틀 기록">
      {selectedId && <CardDetailModal itemId={selectedId} onClose={() => setSelectedId(null)} />}

      <div className="library scanlines mobile-only">
        <div className="quest-select__header"><Hearts filled={2} total={3} /><CoinBadge amount={1240} /></div>
        <h1 className="library__title">도감</h1>
        {tabBar}

        {tab === 'excuse' && (
          <>
            <p className="library__progress-label">수집률 {stats.collected} / {stats.total}</p>
            <div className="library__progress-bar"><ProgressBar value={stats.collected} max={stats.total} color="lime" height={8} /></div>
            <div className="library__filters">
              {FILTERS.slice(0, 5).map((f) => (
                <button key={f.label} className={`chip ${activeFilter === f.label ? 'chip--active' : ''}`} onClick={() => setActiveFilter(f.label)}>{f.label}</button>
              ))}
            </div>
            {excuseGrid()}
          </>
        )}

        {tab === 'battle' && battleGrid()}
        <BottomNav />
      </div>

      <div className="library__desktop-grid desktop-only">
        <div className="library__filter-panel">
          {tabBar}
          {tab === 'excuse' && (
            <>
              <h3>수집률</h3>
              <p className="library__progress-label" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.collected} / {stats.total}</p>
              <ProgressBar value={stats.collected} max={stats.total} color="lime" height={8} />
              <div className="library__filter-section-title">분류</div>
              {FILTERS.map((f) => (
                <button key={f.label} className={`chip ${activeFilter === f.label ? 'chip--active' : ''}`} onClick={() => setActiveFilter(f.label)}>{f.label}</button>
              ))}
            </>
          )}
          {tab === 'battle' && (
            <>
              <h3>배틀 기록</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                총 {battleItems.length}회 · 승 {battleItems.filter((i) => i.success).length}
              </p>
            </>
          )}
        </div>
        <div>
          {tab === 'excuse' ? excuseGrid(true) : battleGrid(true)}
        </div>
      </div>
    </PageLayout>
  );
}
