import './LanguageToggle.css';

export default function LanguageToggle({ language, onToggle }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language selector">
      <button
        className={`lang-toggle-btn${language === 'sl' ? ' active' : ''}`}
        onClick={() => onToggle('sl')}
        aria-pressed={language === 'sl'}
      >
        SL
      </button>
      <button
        className={`lang-toggle-btn${language === 'en' ? ' active' : ''}`}
        onClick={() => onToggle('en')}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
}
