import json
from openai import OpenAI
from typing import Dict, Any

from app.ai.prompt import (
    generate_excuse_prompt,
    generate_defense_reaction_prompt,
    measure_suspicion_prompt,
    analyze_defense_type_prompt,
    generate_preview_prompt,
    generate_daily_prompt,
    generate_enemy_line_prompt,
)


def _parse_json(response_text: str) -> Any:
    text = response_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


class GPTClient:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"

    def _chat(self, system: str, user: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        return response.choices[0].message.content

    def generate_excuses(self, tone: int, risk: int, situation: str) -> Dict[str, Any]:
        prompt = generate_excuse_prompt(situation, tone, risk)
        raw = self._chat("당신은 창의적인 변명 생성 AI입니다. JSON 형식으로만 응답하세요.", prompt)
        return _parse_json(raw)

    def generate_defense_reaction(
        self, original_excuse: str, opponent_reaction: str, user_defense: str, attempt_num: int
    ) -> str:
        prompt = generate_defense_reaction_prompt(original_excuse, opponent_reaction, user_defense, attempt_num)
        raw = self._chat("당신은 현실적인 상대방 역할을 합니다. JSON 형식으로만 응답하세요.", prompt)
        try:
            result = _parse_json(raw)
            return result.get("reaction", "")
        except Exception:
            return raw.strip()

    def measure_suspicion(self, original_excuse: str, conversation_history: list) -> Dict[str, Any]:
        prompt = measure_suspicion_prompt(original_excuse, conversation_history)
        raw = self._chat("당신은 심리 분석가입니다. JSON 형식으로만 응답하세요.", prompt)
        result = _parse_json(raw)
        return {"suspicion": result.get("suspicion", 100), "reason": result.get("reason", "")}

    def analyze_defense_type(self, conversation_history: list) -> Dict[str, Any]:
        prompt = analyze_defense_type_prompt(conversation_history)
        raw = self._chat("당신은 심리 분석가입니다. JSON 형식으로만 응답하세요.", prompt)
        return _parse_json(raw)

    def generate_preview(self, tone: int, risk: int) -> Dict[str, Any]:
        prompt = generate_preview_prompt(tone, risk)
        raw = self._chat("당신은 창의적인 변명 생성 AI입니다. JSON 형식으로만 응답하세요.", prompt)
        result = _parse_json(raw)
        grade = result.get("grade", "F")
        grade_to_title = {"S": "LEGENDARY", "A": "EPIC", "B": "RARE", "C": "COMMON", "F": "TRASH"}
        grade_to_color = {"S": "gold", "A": "purple", "B": "cyan", "C": "lime", "F": "red"}
        return {
            "text": result.get("text", ""),
            "grade": f"{grade} · {grade_to_title.get(grade, 'COMMON')}",
            "grade_color": grade_to_color.get(grade, "red"),
        }

    def generate_daily(self) -> Dict[str, Any]:
        from datetime import datetime
        prompt = generate_daily_prompt()
        raw = self._chat("당신은 창의적인 변명 생성 AI입니다. JSON 형식으로만 응답하세요.", prompt)
        result = _parse_json(raw)
        today = datetime.now().strftime("%m/%d")
        return {"text": result.get("text", ""), "date": today}

    def generate_enemy_line(self, excuse_text: str, attempt_num: int) -> str:
        prompt = generate_enemy_line_prompt(excuse_text, attempt_num)
        raw = self._chat("당신은 상대방 역할을 합니다. JSON 형식으로만 응답하세요.", prompt)
        try:
            result = _parse_json(raw)
            return result.get("enemy_line", "")
        except Exception:
            return raw.strip()
