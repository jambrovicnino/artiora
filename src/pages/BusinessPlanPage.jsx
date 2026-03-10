import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessPlanSections } from '../data/businessPlanContent';
import BusinessPlanNav from '../components/businessplan/BusinessPlanNav';
import LanguageToggle from '../components/businessplan/LanguageToggle';
import FinancialTable from '../components/businessplan/FinancialTable';
import RoadmapTimeline from '../components/businessplan/RoadmapTimeline';
import './BusinessPlanPage.css';

export default function BusinessPlanPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('sl');
  const sectionRefs = useRef({});

  const activeSection = section || businessPlanSections[0].id;

  /* ── Scroll to section on change ── */
  useEffect(() => {
    const el = sectionRefs.current[activeSection];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

  const handleSectionChange = (id) => {
    navigate(`/poslovni-načrt/${id}`, { replace: true });
  };

  const renderSectionContent = (sec) => {
    const title = language === 'sl' ? sec.titleSl : sec.titleEn;
    const content = language === 'sl' ? sec.contentSl : sec.contentEn;
    const paragraphs = content.split('\n\n').filter(Boolean);

    return (
      <article
        key={sec.id}
        id={`bp-${sec.id}`}
        ref={(el) => (sectionRefs.current[sec.id] = el)}
        className={`bp-section${activeSection === sec.id ? ' bp-section-active' : ''}`}
      >
        <header className="bp-section-header">
          <span className="bp-section-icon">{sec.icon}</span>
          <h2 className="bp-section-title">{title}</h2>
        </header>

        <div className="bp-section-body">
          {paragraphs.map((p, i) => (
            <p key={i} className="bp-paragraph">{p}</p>
          ))}

          {/* Financial table for the finance section */}
          {sec.id === 'finance' && sec.financialData && (
            <FinancialTable
              headers={language === 'sl' ? sec.financialData.headersSl : sec.financialData.headersEn}
              rows={sec.financialData.rows}
              language={language}
            />
          )}

          {/* Roadmap timeline for the nacrt section */}
          {sec.id === 'nacrt' && sec.milestones && (
            <RoadmapTimeline milestones={sec.milestones} language={language} />
          )}
        </div>

        <div className="bp-section-divider" />
      </article>
    );
  };

  return (
    <div className="bp-page">
      <BusinessPlanNav
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        language={language}
      />

      <div className="bp-main">
        {/* ── Top bar ── */}
        <div className="bp-topbar">
          <div className="bp-topbar-left">
            <span className="bp-topbar-brand">ARTIORA</span>
            <span className="bp-topbar-separator">/</span>
            <span className="bp-topbar-title">
              {language === 'sl' ? 'Poslovni Načrt' : 'Business Plan'}
            </span>
          </div>
          <LanguageToggle language={language} onToggle={setLanguage} />
        </div>

        {/* ── Hero ── */}
        <div className="bp-hero">
          <span className="bp-hero-label">ARTIORA</span>
          <h1 className="bp-hero-heading">
            {language === 'sl' ? 'Poslovni Načrt' : 'Business Plan'}
          </h1>
          <p className="bp-hero-subtitle">
            {language === 'sl'
              ? 'Certificirana tržnica umetnosti z AI integracijo'
              : 'Certified Art Marketplace with AI Integration'}
          </p>
          <div className="bp-hero-meta">
            <span>{language === 'sl' ? 'Ustanovitelj' : 'Founder'}: Nino P.</span>
            <span className="bp-hero-meta-dot" />
            <span>2024 — 2027</span>
            <span className="bp-hero-meta-dot" />
            <span>Ljubljana, Slovenija</span>
          </div>
        </div>

        {/* ── Sections ── */}
        <div className="bp-content">
          {businessPlanSections.map(renderSectionContent)}
        </div>

        {/* ── Footer ── */}
        <footer className="bp-footer">
          <span className="bp-footer-icon">◆</span>
          <span className="bp-footer-text">
            {language === 'sl'
              ? 'ARTIORA — Umetnost, Certificirana.'
              : 'ARTIORA — Art, Certified.'}
          </span>
        </footer>
      </div>
    </div>
  );
}
