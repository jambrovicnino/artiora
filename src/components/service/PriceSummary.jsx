import './PriceSummary.css';

export default function PriceSummary({ price }) {
  return (
    <div className="price-summary">
      <span className="price-label">Total Price</span>
      <span className="price-value">${price}</span>
    </div>
  );
}
