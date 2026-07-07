export default function ProgressBar({ value = 0, max = 100, color = 'cyan', height = 12 }) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="progress-bar" style={{ height }}>
      <div
        className={`progress-bar__fill progress-bar__fill--${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
