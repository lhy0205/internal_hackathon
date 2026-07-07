import { api } from './client';

// 배틀 시작 → 첫 번째 적 대사 + 초기 의심도 반환
export function startBattle({ questId, excuseText }) {
  return api.post('/battle/start', {
    quest_id: questId,
    excuse_text: excuseText,
  });
}

// 턴 제출 → 유저 입력을 AI가 평가 후 결과 반환
export function submitTurn({ battleId, userInput }) {
  return api.post(`/battle/${battleId}/turn`, {
    user_input: userInput,
  });
}
