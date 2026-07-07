export default function Hearts({ filled = 2, total = 3 }) {
  return (
    <div className="hearts">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`heart ${i >= filled ? 'heart--empty' : ''}`}>
          &#9829;
        </span>
      ))}
    </div>
  );
}
