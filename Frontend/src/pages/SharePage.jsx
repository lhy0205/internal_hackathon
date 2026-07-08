import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import BottomNav from '../components/common/BottomNav';
import StarRating from '../components/common/StarRating';
import '../styles/share.css';

const RANK_COLORS = { F: 'var(--red)', A: 'var(--purple)', S: 'var(--gold)', B: 'var(--cyan)', C: 'var(--lime)' };

export default function SharePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const card = location.state?.card;
  const [toast, setToast] = useState('');

  const rank = card?.rank || 'F';
  const stars = card?.stars || 1;
  const text = card?.text || '변명을 선택해주세요';
  const reaction = card?.reaction || '';

  const shareUrl = window.location.origin;
  const shareText = `[변명 RPG] ${rank} RANK 변명 카드\n"${text}"\n#변명RPG #GuildOfExcuses`;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const copyToClipboard = (str) =>
    navigator.clipboard?.writeText(str)
      .then(() => showToast('클립보드에 복사됐습니다!'))
      .catch(() => showToast('복사 실패. 직접 선택해 복사해주세요.'));

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: '변명 RPG', text: shareText, url: shareUrl })
        .catch(() => {});
    } else {
      copyToClipboard(`${shareText}\n${shareUrl}`);
    }
  };

  const handleShare = (platform) => {
    if (platform === '링크') return copyToClipboard(shareUrl);
    if (platform === '저장') return copyToClipboard(shareText);
    nativeShare();
  };

  return (
    <PageLayout title="전리품 공유" subtitle="SHARE · 변명 카드를 공유하라">
    <div className="share scanlines">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--cyan)', color: '#000', padding: '10px 20px',
          borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12,
          zIndex: 9999, whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
      <h1 className="share__title">전리품 공유</h1>

      <div className="trading-card">
        <div className="trading-card__holo">
          <div className="trading-card__holo-title">변명 RPG</div>
          <div className="trading-card__holo-sub">EXCUSE TRADING CARD</div>
        </div>

        <div className="trading-card__rank-row">
          <span className="trading-card__rank" style={{ color: RANK_COLORS[rank] }}>{rank} RANK</span>
          <StarRating filled={stars} total={5} size={12} />
        </div>

        <div className="trading-card__excuse-text">
          "{text}"
        </div>

        <div className="trading-card__footer">
          {reaction && <p className="trading-card__meta">적 반응: {reaction}</p>}
          <p className="trading-card__result">#변명RPG</p>
        </div>

        <div className="trading-card__hashtag">#변명RPG #GuildOfExcuses</div>
      </div>

      <p className="share__where">어디로 소환할까?</p>
      <div className="share__destinations">
        <button className="share__dest share__dest--pink" onClick={() => handleShare('스토리')}>
          <span className="share__dest-icon" />
          스토리
        </button>
        <button className="share__dest share__dest--gold" onClick={() => handleShare('카톡')}>
          <span className="share__dest-icon" />
          카톡
        </button>
        <button className="share__dest share__dest--cyan" onClick={() => handleShare('링크')}>
          <span className="share__dest-icon" />
          링크
        </button>
        <button className="share__dest share__dest--lime" onClick={() => handleShare('저장')}>
          <span className="share__dest-icon" />
          저장
        </button>
      </div>

      <button
        className="btn-primary btn-primary--purple share__save-btn"
        onClick={() => navigate('/library')}
      >
        카드 이미지 저장 ▶
      </button>

      <p className="share__hint">공유 시 친구가 자동생성 확률 ↑ · 자기성찰</p>

      <BottomNav />
    </div>
    </PageLayout>
  );
}
