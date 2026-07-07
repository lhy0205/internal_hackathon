import { api } from './client';

export function startBattle({ questId, excuseText }) {
  return api.post('/battle/start', {
    quest_id: questId,
    excuse_text: excuseText,
  });
}

export function submitTurn({ battleId, userInput }) {
  return api.post(`/battle/${battleId}/turn`, {
    user_input: userInput,
  });
}
