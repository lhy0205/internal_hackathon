import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import StarRating from '../components/common/StarRating';
import { summonExcuses, saveToLibrary } from '../api/excuses';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../api/auth';
import '../styles/summon-result.css';

const RANK_COLORS = { F: 'var(--red)', A: 'var(--purple)', S: 'var(--gold)', B: 'var(--cyan)', C: 'var(--lime)' };
const RANK_LABELS = { F: '다컬 파문', A: '명작', S: '전설', B: '양작', C: '범작' };

function LoadingCard() {
  return (
    <div className="excuse-card" style={{ borderColor: 'var(--border)', borderWidth: 2.5, borderStyle: 'solid', opacity: 0.6 }}>
      <div className="excuse-card__rank-bar" style={{ background: 'var(--bg-tertiary)' }}>소환 중...</div>
      <div className="excuse-card__body" style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
          SUMMONING...
        </p>
      </div>
    </div>
  );
}

function ExcuseCard({ card, onShare, onSave, saveState, selected, onSelect }) {
  const hasSelection = selected !== undefined;
  return (
    <div
      className="excuse-card"
      style={{
        borderColor: RANK_COLORS[card.rank],
        borderWidth: selected ? 3 : 2.5,
        borderStyle: 'solid',
        transform: hasSelection ? (selected ? 'scale(1.05)' : 'scale(0.92)') : undefined,
        opacity: hasSelection ? (selected ? 1 : 0.65) : undefined,
        transition: 'transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease',
        cursor: onSelect ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 18px ${RANK_COLORS[card.rank]}55` : undefined,
      }}
      onClick={onSelect}
    >
      <div className={`excuse-card__rank-bar excuse-card__rank-bar--${card.rank}`}>
        {card.rank} RANK · {RANK_LABELS[card.rank]}
        {selected && <span style={{ marginLeft: 6, fontSize: 9 }}>▶ 선택됨</span>}
      </div>
      <div className="excuse-card__stars-row">
        <StarRating filled={card.stars} total={5} />
        <span className="excuse-card__code">{card.id}</span>
      </div>
      <div className="excuse-card__body">
        <div className="excuse-card__text-box">
          <p className="excuse-card__text">"{card.text}"</p>
        </div>
        <div className="excuse-card__info-row excuse-card__info-row--reaction">
          <div className="excuse-card__info-label excuse-card__info-label--purple">적 반응</div>
          <div className="excuse-card__info-text">{card.reaction}</div>
        </div>
        <div className="excuse-card__info-row excuse-card__info-row--tip">
          <div className="excuse-card__info-label excuse-card__info-label--gold">퀘스트팁</div>
          <div className="excuse-card__info-text">{card.tip}</div>
        </div>
      </div>
      <div className="excuse-card__actions">
        <button className="excuse-card__action-btn excuse-card__action-btn--copy" onClick={(e) => e.stopPropagation()}>복사</button>
        <button
          className="excuse-card__action-btn excuse-card__action-btn--save"
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          disabled={saveState === 'saved' || saveState === 'saving'}
          style={{ opacity: saveState === 'saved' ? 0.5 : 1 }}
        >
          {saveState === 'saving' ? '...' : saveState === 'saved' ? '저장됨' : '도감'}
        </button>
        <button className="excuse-card__action-btn excuse-card__action-btn--share" onClick={(e) => { e.stopPropagation(); onShare(); }}>공유</button>
      </div>
    </div>
  );
}

export default function SummonResultPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const touchStartX = useRef(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStates, setSaveStates] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    summonExcuses({
      questId: params.questId,
      tone: params.tone,
      risk: params.risk,
      situation: params.situation,
    })
      .then((data) => setCards(data.cards))
      .catch((err) => setError(err.message || '소환 실패'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (card) => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    setSaveStates((prev) => ({ ...prev, [card.id]: 'saving' }));
    saveToLibrary(card)
      .then(() => setSaveStates((prev) => ({ ...prev, [card.id]: 'saved' })))
      .catch(() => setSaveStates((prev) => ({ ...prev, [card.id]: 'error' })));
  };

  const cardArea = (idx) => {
    if (loading) return <LoadingCard />;
    if (error) return (
      <div style={{ textAlign: 'center', padding: 32, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {error}
      </div>
    );
    if (!cards[idx]) return null;
    return (
      <ExcuseCard
        card={cards[idx]}
        saveState={saveStates[cards[idx].id] || 'idle'}
        onSave={() => handleSave(cards[idx])}
        onShare={() => navigate('/share', { state: { card: cards[idx] } })}
      />
    );
  };

  return (
    <PageLayout title="변명 소환 결과" subtitle="SUMMONED · 3장의 변명 카드를 획득했다">
      <div className="summon-result scanlines mobile-only">
        <h1 className="summon-result__title">소환된 변명</h1>
        {!loading && !error && (
          <p className="summon-result__count">{currentIdx + 1} / {cards.length}</p>
        )}
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (dx < -50 && currentIdx < cards.length - 1) setCurrentIdx((i) => i + 1);
            if (dx > 50 && currentIdx > 0) setCurrentIdx((i) => i - 1);
            touchStartX.current = null;
          }}
        >
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={loading || currentIdx === 0}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: currentIdx === 0 ? 'var(--text-secondary)' : 'var(--cyan)',
              fontSize: 16, cursor: currentIdx === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>
          <div style={{ flex: 1 }}>{cardArea(currentIdx)}</div>
          <button
            onClick={() => setCurrentIdx((i) => Math.min(cards.length - 1, i + 1))}
            disabled={loading || currentIdx === cards.length - 1}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: currentIdx === cards.length - 1 ? 'var(--text-secondary)' : 'var(--cyan)',
              fontSize: 16, cursor: currentIdx === cards.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>
        </div>
        {!loading && !error && (
          <div className="summon-result__dots">
            {cards.map((_, i) => (
              <button key={i} className={`summon-result__dot ${i === currentIdx ? 'summon-result__dot--active' : ''}`} onClick={() => setCurrentIdx(i)} />
            ))}
          </div>
        )}
        <button className="btn-primary btn-primary--red summon-result__submit" disabled={loading} onClick={() => navigate('/battle', { state: { questId: params.questId, excuseText: cards[currentIdx]?.text, excuseId: cards[currentIdx]?.id } })}>
          전투 개시 ▶
        </button>
        <BottomNav />
      </div>

      <div className="summon-result desktop-only">
        <div className="summon-result__desktop-info">
          <h2 className="summon-result__title" style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--pink)' }}>획득한 변명 카드</h2>
          <span className="summon-result__hint">
            카드를 클릭해 선택 후 배틀을 시작하세요
          </span>
        </div>
        <div className="summon-result__cards-row">
          {loading
            ? [0, 1, 2].map((i) => <LoadingCard key={i} />)
            : error
              ? <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</p>
              : cards.map((card, i) => (
                  <ExcuseCard
                    key={card.id}
                    card={card}
                    saveState={saveStates[card.id] || 'idle'}
                    onSave={() => handleSave(card)}
                    onShare={() => navigate('/share', { state: { card } })}
                    selected={selectedIdx === i}
                    onSelect={() => setSelectedIdx(i)}
                  />
                ))
          }
        </div>
        <div className="summon-result__actions-row">
          <button className="btn-primary btn-primary--red" disabled={loading || !cards[selectedIdx]} onClick={() => navigate('/battle', { state: { questId: params.questId, excuseText: cards[selectedIdx]?.text, excuseId: cards[selectedIdx]?.id } })}>
            ▶ 디펜스 배틀 시작
          </button>
          <button className="btn-secondary" onClick={() => navigate('/quest-select')}>
            다시 소환 (MP30)
          </button>
          <button className="btn-primary" disabled={loading} onClick={() => navigate('/share')}>
            전부 공유하기
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
