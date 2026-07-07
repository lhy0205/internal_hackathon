from typing import Dict, List, Optional
from datetime import datetime


class BattleStorage:
    """배틀 세션 대화 기록 저장소 (인메모리)"""

    def __init__(self):
        self.battles: Dict[str, Dict] = {}

    def create_battle(self, battle_id: str, excuse_text: str) -> None:
        self.battles[battle_id] = {
            "excuse_text": excuse_text,
            "conversation_history": [],
            "attempt_num": 0,
            "suspicion": 0,
        }

    def get_battle(self, battle_id: str) -> Optional[Dict]:
        return self.battles.get(battle_id)

    def update_battle_turn(
        self, battle_id: str, user_input: str, enemy_reaction: str, suspicion: int
    ) -> None:
        if battle_id in self.battles:
            self.battles[battle_id]["conversation_history"].append(
                {"user": user_input, "opponent": enemy_reaction}
            )
            self.battles[battle_id]["attempt_num"] += 1
            self.battles[battle_id]["suspicion"] = suspicion


battle_storage = BattleStorage()
