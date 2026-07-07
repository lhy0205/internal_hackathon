export default function LevelBar({ level = 0, max = 10, color = 'cyan' }) {
  return (
    <div className="level-bar">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`level-bar__segment ${
            i < level ? `level-bar__segment--filled-${color}` : ''
          }`}
        />
      ))}
    </div>
  );
}
