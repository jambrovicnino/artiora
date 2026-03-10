import './ServiceCard.css';

export default function ServiceCard({ service }) {
  const { romanNumeral, name, description } = service;

  return (
    <div className="artiora-card">
      {/* Corner decorations */}
      <div className="card-corner card-corner-tl" />
      <div className="card-corner card-corner-tr" />
      <div className="card-corner card-corner-bl" />
      <div className="card-corner card-corner-br" />

      <div className="card-body">
        <span className="card-numeral">{romanNumeral}</span>
        <h3 className="card-title">
          <span className="card-title-bar" />
          {name}
        </h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
}
