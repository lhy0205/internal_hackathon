import { api } from './client';

export function fetchLibrary(filter = '전체') {
  const params = filter !== '전체' ? `?category=${encodeURIComponent(filter)}` : '';
  return api
    .get(`/library${params}`)
    .then((data) => ({
      items: data.items.map((item) => ({
        id: item.id,
        category: item.category,
        rank: item.rank,
        rankColor: item.rank_color,
        stars: item.stars,
        text: item.text,
      })),
    }));
}

export function fetchLibraryStats() {
  return api.get('/library/stats');
}

export function fetchLibraryItem(id) {
  return api
    .get(`/library/${id}`)
    .then((data) => ({
      id: data.id,
      category: data.category,
      rank: data.rank,
      rankColor: data.rank_color,
      stars: data.stars,
      text: data.text,
      reaction: data.reaction,
      tip: data.tip,
      savedAt: data.saved_at,
    }));
}

export function fetchBattleLibrary() {
  return api
    .get('/battle-library')
    .then((data) => ({
      items: data.items.map((item) => ({
        id: item.id,
        excuseText: item.excuse_text,
        success: item.success,
        suspicion: item.suspicion,
        turns: item.turns,
        defenseType: item.defense_type,
        defenseTypeReason: item.defense_type_reason,
        savedAt: item.saved_at,
      })),
    }));
}

export function saveBattleResult({ excuseText, success, suspicion, turns, defenseType }) {
  return api.post('/battle-library/save', {
    excuse_text: excuseText,
    success,
    suspicion,
    turns,
    defense_type: defenseType?.defense_type || null,
    defense_type_reason: defenseType?.reason || null,
  });
}
