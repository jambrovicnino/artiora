import { useState } from 'react';
import { businessPlanSections } from '../../data/businessPlanContent';
import './BusinessPlanNav.css';

export default function BusinessPlanNav({ activeSection, onSectionChange, language }) {
  const [collapsed, setCollapsed] = useState(true);

  const handleClick = (id) => {
    onSectionChange(id);
    setCollapsed(true);
  };

  return (
    <nav className="bp-nav">
      <button
        className="bp-nav-toggle"
        onClick={() => setCollapsed((v) => !v)}
        aria-label="Toggle navigation"
      >
        <span className="bp-nav-toggle-icon">{collapsed ? '☰' : '✕'}</span>
        <span className="bp-nav-toggle-label">
          {language === 'sl' ? 'Poglavja' : 'Chapters'}
        </span>
      </button>

      <div className={`bp-nav-list-wrapper${collapsed ? '' : ' open'}`}>
        <div className="bp-nav-header">
          <span className="bp-nav-header-icon">◆</span>
          <span className="bp-nav-header-text">
            {language === 'sl' ? 'Poslovni Načrt' : 'Business Plan'}
          </span>
        </div>

        <ul className="bp-nav-list">
          {businessPlanSections.map((section, i) => (
            <li key={section.id}>
              <button
                className={`bp-nav-item${activeSection === section.id ? ' active' : ''}`}
                onClick={() => handleClick(section.id)}
              >
                <span className="bp-nav-item-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="bp-nav-item-icon">{section.icon}</span>
                <span className="bp-nav-item-label">
                  {language === 'sl' ? section.titleSl : section.titleEn}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
