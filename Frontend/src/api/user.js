import { api } from './client';

export function fetchUserProfile() {
  return api
    .get('/user/profile')
    .then((data) => ({
      name: data.name,
      level: data.level,
      title: data.title,
      xp: data.xp,
      xpMax: data.xp_max,
      coins: data.coins,
      mp: data.mp,
    }));
}

export function fetchUserStats() {
  return api
    .get('/user/stats')
    .then((data) =>
      data.map((s) => ({
        value: s.value,
        label: s.label,
        color: `var(--${s.color})`,
      }))
    );
}

export function fetchAchievements() {
  return api.get('/user/achievements');
}

export function fetchHistory() {
  return api
    .get('/user/history')
    .then((data) =>
      data.map((h) => ({
        rank: h.rank,
        rankColor: `var(--${h.rank_color})`,
        text: h.text,
        date: h.date,
      }))
    );
}

export function shareExcuse({ excuseId, platform }) {
  return api.post('/share', { excuse_id: excuseId, platform });
}
