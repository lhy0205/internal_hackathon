export default function CoinBadge({ amount = 0 }) {
  return (
    <div className="coin-badge">
      <span className="coin-badge__icon">C</span>
      <span className="coin-badge__amount">{amount.toLocaleString()}</span>
    </div>
  );
}
