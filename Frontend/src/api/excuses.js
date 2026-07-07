import { api } from './client';

export function fetchQuests() {
  return api.get('/quests');
}

export function summonExcuses({ questId, tone, risk, situation }) {
  return api
    .post('/excuses/summon', { quest_id: questId, tone, risk, situation })
    .then((data) => ({
      cards: data.cards.map((c) => ({
        id: c.id,
        rank: c.rank,
        stars: c.stars,
        text: c.text,
        reaction: c.reaction,
        tip: c.tip,
        category: c.category || null,
      })),
    }));
}

export function fetchSkillPreview({ tone, risk }) {
  return api
    .get(`/excuses/preview?tone=${tone}&risk=${risk}`)
    .then((data) => ({
      text: data.text,
      grade: data.grade,
      gradeColor: `var(--${data.grade_color})`,
    }));
}

export function fetchDailyQuote() {
  return api.get('/excuses/daily');
}

export function saveToLibrary(card) {
  return api.post('/library/save', {
    rank: card.rank,
    stars: card.stars,
    text: card.text,
    reaction: card.reaction,
    tip: card.tip,
    category: card.category || null,
  });
}
