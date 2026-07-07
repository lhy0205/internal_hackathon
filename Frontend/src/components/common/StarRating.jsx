export default function StarRating({ filled = 0, total = 5, size = 14 }) {
  return (
    <div className="star-rating">
      {Array.from({ length: total }, (_, i) => (
        <svg
          key={i}
          className={`star-rating__star ${i < filled ? 'star-rating__star--filled' : 'star-rating__star--empty'}`}
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="currentColor"
        >
          <polygon points="7,1 8.8,5.2 13.4,5.6 9.8,8.8 10.9,13.3 7,10.9 3.1,13.3 4.2,8.8 0.6,5.6 5.2,5.2" />
        </svg>
      ))}
    </div>
  );
}
