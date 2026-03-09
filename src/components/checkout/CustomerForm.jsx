import './CustomerForm.css';

export default function CustomerForm({ customerInfo, setCustomerInfo, errors }) {
  const update = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="customer-form">
      <h3>Podatki za dostavo</h3>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="cf-name">Ime in priimek *</label>
          <input
            id="cf-name"
            type="text"
            value={customerInfo.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Janez Novak"
            className={errors?.name ? 'field-error' : ''}
          />
          {errors?.name && <span className="field-error-msg">{errors.name}</span>}
        </div>
      </div>

      <div className="form-row form-row-2col">
        <div className="form-field">
          <label htmlFor="cf-email">Email *</label>
          <input
            id="cf-email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="janez@email.com"
            className={errors?.email ? 'field-error' : ''}
          />
          {errors?.email && <span className="field-error-msg">{errors.email}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="cf-phone">Telefon *</label>
          <input
            id="cf-phone"
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+386 31 123 456"
            className={errors?.phone ? 'field-error' : ''}
          />
          {errors?.phone && <span className="field-error-msg">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="cf-address">Naslov za dostavo *</label>
          <input
            id="cf-address"
            type="text"
            value={customerInfo.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="Slovenska cesta 1, 1000 Ljubljana"
            className={errors?.address ? 'field-error' : ''}
          />
          {errors?.address && <span className="field-error-msg">{errors.address}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="cf-note">Opomba (neobvezno)</label>
          <textarea
            id="cf-note"
            value={customerInfo.note || ''}
            onChange={(e) => update('note', e.target.value)}
            placeholder="Dodatne želje ali navodila za dostavo..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
