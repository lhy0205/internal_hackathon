import { useState } from 'react';

const HINT_EXAMPLES = [
  '약속 2시간 전',
  '단톡방에서 갑자기',
  '교수님 메일로',
  '부장님 앞에서',
  '엄마한테 전화로',
];

export default function SituationInput({ value, onChange, maxLength = 200 }) {
  const handleHintClick = (hint) => {
    const prefix = value ? value + ' ' : '';
    const next = prefix + hint;
    if (next.length <= maxLength) {
      onChange(next);
    }
  };

  return (
    <div className="situation-input">
      <div className="situation-input__header">
        <span className="situation-input__label">상황 설명 (CONTEXT)</span>
        <span className="situation-input__count">{value.length}/{maxLength}</span>
      </div>

      <textarea
        className="situation-input__field"
        placeholder={"예) 친구가 갑자기 저녁 약속 잡았는데 오늘 너무 피곤해서 집에 있고 싶음. 30분 전에 인스타 스토리 올린 게 문제..."}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) onChange(e.target.value);
        }}
      />

      <div className="situation-input__hints">
        {HINT_EXAMPLES.map((hint) => (
          <button
            key={hint}
            className="situation-input__hint-chip"
            onClick={() => handleHintClick(hint)}
          >
            + {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
