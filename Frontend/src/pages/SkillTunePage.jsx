import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import Hearts from '../components/common/Hearts';
import CoinBadge from '../components/common/CoinBadge';
import LevelBar from '../components/common/LevelBar';
import SituationInput from '../components/common/SituationInput';
import { fetchSkillPreview } from '../api/excuses';
import '../styles/skill-tune.css';

const DEFAULT_PREVIEW = { text: '슬라이더를 조절해 보세요', grade: '? · ???', gradeColor: 'var(--border)' };

export default function SkillTunePage() {
  const [tone, setTone] = useState(5);
  const [risk, setRisk] = useState(9);
  const [situation, setSituation] = useState('');
  const [preview, setPreview] = useState(DEFAULT_PREVIEW);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const questId = location.state?.questId;

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSkillPreview({ tone, risk })
        .then(setPreview)
        .catch(() => {});
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [tone, risk]);

  return (
    <PageLayout title="스킬 조절" subtitle="TUNE · 변명의 속성을 설정하라">
      <div className="skill-tune scanlines">
        <div className="quest-select__header">
          <Hearts filled={2} total={3} />
          <CoinBadge amount={1240} />
        </div>

        <h1 className="skill-tune__title">스킬 조절</h1>
        <p className="skill-tune__subtitle">변명의 속성을 설정하라</p>

        <div className="skill-tune__quest-badge">
          <svg viewBox="0 0 24 24">
            <path d="M12 5v22M0 7.6q13-3.9 13 0v19.5q0-3.9-13 0z" />
            <path d="M24 7.6q-13-3.9-13 0" />
          </svg>
          <span>프레이드</span>
        </div>

        <SituationInput value={situation} onChange={setSituation} />

        <div className="skill-section">
          <div className="skill-section__header">
            <span className="skill-section__name">전달톤 (TONE)</span>
            <span className="skill-section__level" style={{ color: 'var(--cyan)' }}>LV.{tone}</span>
          </div>
          <LevelBar level={tone} max={10} color="cyan" />
          <input
            type="range"
            className="skill-slider"
            min={1} max={10} value={tone}
            onChange={(e) => setTone(Number(e.target.value))}
          />
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
          <input
            type="range"
            className="skill-slider"
            min={1} max={10} value={risk}
            onChange={(e) => setRisk(Number(e.target.value))}
          />
          <div className="skill-section__labels">
            <span className="skill-section__label">신뢰도 없음</span>
            <span className="skill-section__label">신뢰도 있음</span>
          </div>
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
            <span className="skill-preview__grade-value" style={{ color: preview.gradeColor }}>
              {preview.grade}
            </span>
          </div>
        </div>

        <button
          className="btn-primary skill-tune__submit"
          onClick={() => navigate('/summon-result', { state: { tone, risk, situation, questId } })}
        >
          변명 소환 ▶
        </button>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
