import { Link, useLocation } from 'react-router-dom';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const ref = state?.ref || 'ET-XXXXXX';

  return (
    <div className="confirmation-page container">
      <div className="confirmation-card">
        <div className="confirmation-icon">&#10003;</div>
        <h1>Naročilo Potrjeno!</h1>
        <p className="confirmation-ref">Referenca: <strong>{ref}</strong></p>
        <p>
          Hvala za vaše naročilo. Začeli bomo z delom na vaših fotografijah.
          Kmalu boste prejeli e-poštno potrdilo.
        </p>
        <Link to="/" className="btn-gold">NAZAJ NA ZAČETEK</Link>
      </div>
    </div>
  );
}
