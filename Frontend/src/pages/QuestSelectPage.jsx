import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import Hearts from '../components/common/Hearts';
import CoinBadge from '../components/common/CoinBadge';
import LevelBar from '../components/common/LevelBar';
import SituationInput from '../components/common/SituationInput';
import { fetchSkillPreview, fetchDailyQuote } from '../api/excuses';
import '../styles/quest-select.css';
import '../styles/skill-tune.css';

const QUESTS = [
  { id: 'promise', name: '약속', desc: '친구 도주', color: 'cyan', difficulty: '★★★', diffColor: '#22d3ee',
    icon: <svg viewBox="0 0 24 24"><path d="M5 12l6.5 5.2 13-9.1M23 12l-6.5 5.2" /><circle cx="12" cy="17.2" r="2" fill="currentColor" /></svg> },
  { id: 'homework', name: '과제·팀플', desc: '프레이드', color: 'purple', difficulty: '★★★', diffColor: '#a855f7',
    icon: <svg viewBox="0 0 24 24"><path d="M12 5v22M0 7.6q13-3.9 13 0v19.5q0-3.9-13 0z" /><path d="M24 7.6q-13-3.9-13 0" /></svg> },
  { id: 'social', name: '회식·모임', desc: '회식 탈출', color: 'gold', difficulty: '★★★', diffColor: '#fbbf24',
    icon: <svg viewBox="0 0 24 24"><path d="M6 10h12v14q0 3-6 3-6 0-6-3z" /><path d="M18 13h5v7h-5" /><path d="M6 13h12" /></svg> },
  { id: 'work', name: '야근', desc: '야근 탈출', color: 'lime', difficulty: '★★★', diffColor: '#a3e635',
    icon: <svg viewBox="0 0 24 24"><path d="M4 16l4-8h12l4 8z" /><path d="M8 16v14h12V16" /></svg> },
  { id: 'family', name: '가족 행사', desc: '본가 보스전', color: 'pink', difficulty: '★★★', diffColor: '#f43f8e',
    icon: <svg viewBox="0 0 24 24"><path d="M4 20l10-10 10 10" /><path d="M7 18v9h10V18" /></svg> },
];

const DEFAULT_PREVIEW = { text: '슬라이더를 조절해 보세요', grade: '? · ???', gradeColor: 'var(--border)' };

function DailyQuote() {
  const [quote, setQuote] = useState({ text: '지금 일어났는데 이미 늦었다…', date: '' });

  useEffect(() => {
    fetchDailyQuote().then(setQuote).catch(() => {});
  }, []);

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1.5px solid var(--gold)',
      borderRadius: 12, overflow: 'hidden', marginTop: 24
    }}>
      <div style={{
        background: 'var(--gold-dark)', padding: '8px 14px',
        fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.05em'
      }}>
        오늘의 핑계 문장 · DAILY
      </div>
      <div style={{ padding: '16px 14px' }}>
        <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>"{quote.text}"</p>
        {quote.date && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 8 }}>
            {quote.date} 발급
          </p>
        )}
      </div>
    </div>
  );
}

function SkillTuneInline({ tone, risk, setTone, setRisk, situation, setSituation, preview, onSubmit }) {
  return (
    <div className="skill-tune--inline">
      <SituationInput value={situation} onChange={setSituation} />

      <div className="skill-tune__quest-badge">
        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--purple)', fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d="M12 5v22M0 7.6q13-3.9 13 0v19.5q0-3.9-13 0z" />
          <path d="M24 7.6q-13-3.9-13 0" />
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--purple)', fontWeight: 500 }}>프레이드</span>
      </div>

      <div className="skill-section">
        <div className="skill-section__header">
          <span className="skill-section__name">전달톤 (TONE)</span>
          <span className="skill-section__level" style={{ color: 'var(--cyan)' }}>LV.{tone}</span>
        </div>
        <LevelBar level={tone} max={10} color="cyan" />
        <input type="range" className="skill-slider" min={1} max={10} value={tone} onChange={(e) => setTone(Number(e.target.value))} />
        <div className="skill-section__labels">
          <span className="skill-section__label">반말</span>
          <span className="skill-section__label">극존칭</span>
        </div>
      </div>

      <div className="skill-section">
        <div className="skill-section__header">
          <span className="skill-section__name">신뢰도 (RISK)</span>
          <span className="skill-section__level" style={{ color: 'var(--red)' }}>LV.{risk}</span>
        </div>
        <LevelBar level={risk} max={10} color="red" />
        <input type="range" className="skill-slider" min={1} max={10} value={risk} onChange={(e) => setRisk(Number(e.target.value))} />
        <div className="skill-section__labels">
          <span className="skill-section__label">신뢰도 없음</span>
          <span className="skill-section__label">신뢰도 있음</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>소환 비용</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)', fontWeight: 700 }}>MP 30</span>
      </div>

      <div className="skill-preview" style={{ borderColor: preview.gradeColor }}>
        <div className="skill-preview__header">
          <span className="skill-preview__title">SKILL PREVIEW</span>
          <span className="skill-preview__cost">MP 30</span>
        </div>
        <div className="skill-preview__body">
          <p className="skill-preview__text">"{preview.text}"</p>
        </div>
        <div className="skill-preview__grade">
          <span className="skill-preview__grade-label">예상 등급</span>
          <span className="skill-preview__grade-value" style={{ color: preview.gradeColor }}>{preview.grade}</span>
        </div>
      </div>

      <button className="btn-primary" style={{ marginTop: 16 }} onClick={onSubmit}>
        ▶ 변명 3장 소환
      </button>

      <DailyQuote />
    </div>
  );
}

export default function QuestSelectPage() {
  const [selectedId, setSelectedId] = useState('homework');
  const [tone, setTone] = useState(5);
  const [risk, setRisk] = useState(9);
  const [situation, setSituation] = useState('');
  const [preview, setPreview] = useState(DEFAULT_PREVIEW);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSkillPreview({ tone, risk })
        .then(setPreview)
        .catch(() => {});
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [tone, risk]);

  const questList = (
    <>
      {QUESTS.map((quest) => (
        <div
          key={quest.id}
          className={`quest-card ${selectedId === quest.id ? 'quest-card--selected' : ''}`}
          onClick={() => setSelectedId(quest.id)}
        >
          {selectedId === quest.id && <span className="quest-card__select-badge">SELECT</span>}
          <div className={`quest-card__icon quest-card__icon--${quest.color}`}>{quest.icon}</div>
          <div className="quest-card__info">
            <div className="quest-card__name">{quest.name}</div>
            <div className="quest-card__desc">{quest.desc}</div>
          </div>
          <div className="quest-card__meta">
            <div className="quest-card__difficulty" style={{ color: quest.diffColor }}>{quest.difficulty}</div>
            <div className="quest-card__difficulty-label">난이도</div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <PageLayout title="변명 소환소" subtitle="SUMMON · 상황을 고르고 변명을 뽑아라">
      {/* Mobile */}
      <div className="quest-select scanlines mobile-only">
        <div className="quest-select__header">
          <Hearts filled={2} total={3} />
          <CoinBadge amount={1240} />
        </div>
        <h1 className="quest-select__title">퀘스트 선택</h1>
        <p className="quest-select__subtitle">어떤 상황에서 도망칠까?</p>
        {questList}
        <button className="btn-primary btn-primary--purple quest-select__submit" onClick={() => navigate('/skill-tune', { state: { questId: selectedId } })}>
          입장하기 ▶
        </button>
        <BottomNav />
      </div>

      {/* Desktop */}
      <div className="quest-select__desktop-grid desktop-only">
        <div className="quest-select__left-col">
          <h2>① 퀘스트 선택</h2>
          {questList}
        </div>
        <div className="quest-select__right-col">
          <h2>② 스킬 조절</h2>
          <SkillTuneInline
            tone={tone} risk={risk}
            setTone={setTone} setRisk={setRisk}
            situation={situation} setSituation={setSituation}
            preview={preview}
            onSubmit={() => navigate('/summon-result', { state: { tone, risk, situation, questId: selectedId } })}
          />
        </div>
      </div>
    </PageLayout>
  );
}
