import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import StarRating from '../components/common/StarRating';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../api/auth';
import { saveBattleResult } from '../api/library';
import '../styles/victory.css';

const CONFETTI_COLORS = ['#a855f7', '#f43f8e', '#22d3ee', '#fbbf24', '#a3e635'];

function ConfettiPieces() {
  return (
    <div className="victory__confetti">
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}px`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function VictoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success = true, suspicion = 0, turns = 3, defenseType = null, excuseText = null } = location.state || {};
  const [saveState, setSaveState] = useState('idle');
  const { user } = useAuth();

  const isVictory = success;

  const handleSaveBattle = () => {
    if (!user) {
      localStorage.setItem('pendingSave', JSON.stringify({
        type: 'battle',
        data: { excuseText, success, suspicion, turns, defenseType },
      }));
      localStorage.setItem('pendingReturn', '/library');
      loginWithGoogle();
      return;
    }
    setSaveState('saving');
    saveBattleResult({ excuseText, success, suspicion, turns, defenseType })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'));
  };

  const content = (
    <div className={`victory scanlines ${!isVictory ? 'victory--defeat' : ''}`}>
      {isVictory && <ConfettiPieces />}

      <h1 className="victory__heading" style={{ color: isVictory ? 'var(--gold)' : 'var(--red)' }}>
        {isVictory ? 'VICTORY!' : 'DEFEAT...'}
      </h1>
      <p className="victory__sub">
        {isVictory
          ? `디펜스 성공 · 최종 의심도 ${suspicion}%`
          : `디펜스 실패 · 최종 의심도 ${suspicion}%`}
      </p>

      {isVictory && (
        <div className="victory__stars">
          <StarRating filled={suspicion <= 10 ? 3 : suspicion <= 30 ? 2 : 1} total={3} size={22} />
        </div>
      )}

      {isVictory && defenseType && (
        <div className="defense-type-card">
          <div className="defense-type-card__header">
            ⚔ 나의 디펜스 유형
          </div>
          <div className="defense-type-card__body">
            <div className="defense-type-card__type">{defenseType.defense_type}</div>
            <p className="defense-type-card__reason">{defenseType.reason}</p>
          </div>
        </div>
      )}

      <div className="rewards-card">
        <div className="rewards-card__header">{isVictory ? 'REWARDS' : 'RESULT'}</div>
        <div className="rewards-card__body">
          <div className="rewards-card__item">
            <span className="rewards-card__item-dot" style={{ background: 'var(--cyan)' }} />
            <span className="rewards-card__item-label">진행 턴</span>
            <div className="rewards-card__item-value">{turns} / 3 턴</div>
          </div>
          <div className="rewards-card__item">
            <span className="rewards-card__item-dot" style={{ background: 'var(--red)' }} />
            <span className="rewards-card__item-label">최종 의심도</span>
            <div className="rewards-card__item-value">{suspicion}%</div>
          </div>
          {isVictory && (
            <div className="rewards-card__item">
              <span className="rewards-card__item-dot" style={{ background: 'var(--gold)' }} />
              <span className="rewards-card__item-label">획득 코인</span>
              <div className="rewards-card__item-value">+120 ©</div>
            </div>
          )}
          <p className="rewards-card__warning">
            ※ 같은 적 2주 내 재사용 시 의심도 +20%
          </p>
        </div>
      </div>

      <div className="victory__actions">
        <button
          className="btn-primary"
          onClick={handleSaveBattle}
          disabled={saveState === 'saving' || saveState === 'saved'}
          style={{ opacity: saveState === 'saved' ? 0.6 : 1 }}
        >
          {saveState === 'saving' ? '저장 중...' : saveState === 'saved' ? '✓ 디펜스 도감 저장됨' : '디펜스 도감에 저장 ▶'}
        </button>
        {isVictory && (
          <button className="btn-secondary" onClick={() => navigate('/share')}>
            전리품 공유
          </button>
        )}
        <button className="btn-secondary" onClick={() => navigate('/quest-select')}>
          새 변명 뽑기
        </button>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          다시 도전
        </button>
      </div>

      <BottomNav />
    </div>
  );

  return (
    <PageLayout title="디펜스 배틀" subtitle={`BATTLE · ${isVictory ? '디펜스 성공' : '디펜스 실패'}`}>
      {content}
    </PageLayout>
  );
}
