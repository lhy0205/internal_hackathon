import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import ProgressBar from '../components/common/ProgressBar';
import { startBattle, submitTurn } from '../api/battle';
import '../styles/battle.css';

function EnemyAvatar({ size = 56 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size * 0.5, height: size * 0.5, stroke: 'var(--red)', fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <path d="M5 12l6.5 5.2 13-9.1M23 12l-6.5 5.2" />
      <circle cx="12" cy="17.2" r="2" fill="var(--red)" />
    </svg>
  );
}

export default function BattlePage() {
  const [battleId, setBattleId] = useState(null);
  const [suspicion, setSuspicion] = useState(60);
  const [turn, setTurn] = useState(1);
  const [enemyLine, setEnemyLine] = useState('');
  const [userInput, setUserInput] = useState('');
  const [log, setLog] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { questId, excuseText, excuseId } = location.state || {};

  useEffect(() => {
    startBattle({ questId, excuseText })
      .then((data) => {
        setBattleId(data.battle_id);
        setSuspicion(data.suspicion);
        setEnemyLine(data.enemy_line);
      })
      .catch(() => {
        // 백엔드 연결 전 임시 대사
        setEnemyLine('아까 OO역 근처에서 본 것 같은데? 사진 한 장만 보내봐 ㅋㅋ');
      })
      .finally(() => setInitializing(false));
  }, []);

  const handleSubmit = () => {
    if (!userInput.trim() || submitting) return;
    setSubmitting(true);

    submitTurn({ battleId, userInput })
      .then((data) => {
        const prevSuspicion = suspicion;
        setSuspicion(data.suspicion);
        setLog((prev) => [
          ...prev,
          {
            turn,
            input: userInput,
            reaction: data.enemy_reaction,
            suspicionBefore: prevSuspicion,
            suspicionAfter: data.suspicion,
          },
        ]);
        setUserInput('');

        if (data.is_final) {
          setTimeout(() => navigate('/victory', { state: { success: data.success, suspicion: data.suspicion, turns: turn, defenseType: data.defense_type, excuseId, excuseText } }), 800);
        } else {
          setTurn((t) => t + 1);
          setEnemyLine(data.enemy_line);
          inputRef.current?.focus();
        }
      })
      .catch(() => {
        // 백엔드 연결 전 임시 처리
        const fakeChange = Math.floor(Math.random() * 20) + 5;
        const newSuspicion = Math.max(0, suspicion - fakeChange);
        setLog((prev) => [...prev, { turn, input: userInput, reaction: '...', suspicionBefore: suspicion, suspicionAfter: newSuspicion }]);
        setSuspicion(newSuspicion);
        setUserInput('');
        if (turn >= 3 || newSuspicion <= 0) {
          setTimeout(() => navigate('/victory', { state: { success: newSuspicion <= 0, suspicion: newSuspicion, turns: turn } }), 800);
        } else {
          setTurn((t) => t + 1);
          setEnemyLine('진짜? 근데 아까 인스타 접속 기록 있던데?');
        }
      })
      .finally(() => setSubmitting(false));
  };

  const excuseBox = excuseText && (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--cyan)',
      borderRadius: 8, padding: '10px 14px', marginBottom: 16,
      fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6,
    }}>
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--cyan)', display: 'block', marginBottom: 4 }}>내 변명</span>
      "{excuseText}"
    </div>
  );

  const enemySection = (
    <>
      {excuseBox}
      <div className="battle__enemy">
        <div className="battle__enemy-avatar"><EnemyAvatar /></div>
        <div className="battle__enemy-info">
          <div className="battle__enemy-label">ENEMY</div>
          <div className="battle__enemy-name">의심하는 친구 Lv.7</div>
          <div className="battle__enemy-bar">
            <span className="battle__enemy-bar-label">의심도</span>
            <div style={{ flex: 1 }}><ProgressBar value={suspicion} max={100} color="red" height={12} /></div>
            <span className="battle__enemy-bar-value">{suspicion}%</span>
          </div>
        </div>
      </div>
      <div className="battle__speech">
        <p>{initializing ? '...' : `"${enemyLine}"`}</p>
      </div>
    </>
  );

  const inputSection = (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--cyan)', marginBottom: 8 }}>
        내 변명 입력
      </div>
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        placeholder="변명을 입력하세요..."
        disabled={submitting || initializing}
        style={{
          width: '100%', minHeight: 80, padding: '10px 12px',
          background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
          fontSize: 14, lineHeight: 1.6, resize: 'none', boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      <button
        className="btn-primary"
        style={{ marginTop: 10, width: '100%', opacity: submitting ? 0.6 : 1 }}
        onClick={handleSubmit}
        disabled={submitting || initializing || !userInput.trim()}
      >
        {submitting ? '판정 중...' : `전송 ▶ (TURN ${turn}/3)`}
      </button>
    </div>
  );

  return (
    <PageLayout title="디펜스 배틀" subtitle={`BATTLE · TURN ${turn}/3 · 의심을 잠재워라`}>
      <div className="battle scanlines mobile-only">
        <h1 className="battle__title">디펜스 배틀</h1>
        {enemySection}
        {inputSection}
        <p className="battle__hint">Enter로 빠르게 전송 가능</p>
        <BottomNav />
      </div>

      <div className="battle__desktop-grid desktop-only">
        <div className="battle__arena">
          {excuseBox}
          <div className="battle__arena-enemy">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>ENEMY · 의심하는 친구 Lv.7</div>
            <div className="battle__arena-avatar-lg"><EnemyAvatar size={104} /></div>
            <div style={{ maxWidth: 460, margin: '12px auto 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>의심도</span>
                <div style={{ flex: 1 }}><ProgressBar value={suspicion} max={100} color="red" /></div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{suspicion}%</span>
              </div>
            </div>
          </div>

          <div className="battle__speech" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            <p>{initializing ? '...' : `"${enemyLine}"`}</p>
          </div>

          {inputSection}
        </div>

        <div className="battle__log">
          <div className="battle__log-header">적의 속마음</div>
          <div className="battle__log-body">
            <div className="battle__log-turns">
              {[1, 2, 3].map((t) => (
                <span key={t} className={`battle__log-turn ${t < turn ? 'battle__log-turn--done' : t === turn ? 'battle__log-turn--current' : ''}`}>
                  {t}
                </span>
              ))}
            </div>

            {log.length === 0 && (
              <div className="battle__log-entry">
                <div className="battle__log-entry-turn" style={{ color: 'var(--red)' }}>now</div>
                <div className="battle__log-entry-text">상대가 의심하기 시작한다</div>
              </div>
            )}

            {log.map((entry, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="battle__log-entry">
                  <div className="battle__log-entry-turn" style={{ color: 'var(--cyan)' }}>T{entry.turn}</div>
                  <div className="battle__log-entry-text">"{entry.input}"</div>
                </div>
                {entry.reaction && (
                  <div className="battle__log-entry" style={{ marginTop: 4 }}>
                    <div className="battle__log-entry-turn" style={{ color: 'var(--red)' }}>→</div>
                    <div className="battle__log-entry-text" style={{ color: 'var(--text-secondary)' }}>
                      {entry.reaction} · 의심 {entry.suspicionBefore}→{entry.suspicionAfter}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
