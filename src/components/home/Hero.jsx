import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraModal from '../common/CameraModal.jsx';
import HeroLeaves from './HeroLeaves';
import './Hero.css';

export default function Hero() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Datoteka je prevelika. Največja dovoljena velikost je 20 MB.');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Podpiramo samo JPG in PNG formate.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      navigate('/studio', {
        state: { image: ev.target.result, fileName: file.name },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => processFile(e.target.files?.[0]);

  const handleViewExample = () => {
    navigate('/studio', {
      state: { image: '/demo/family-portrait.jpg', fileName: 'primer.jpg', isDemo: true },
    });
  };

  // Drag & Drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <section className="hero" id="hero">
      {/* Aurora background waves */}
      <HeroLeaves />

      <div className="container">
        <div className="hero-content">
          <p className="hero-established">UMETNOST BREZ MEJA</p>

          <h1 className="hero-heading">
            <span className="hero-heading-main">USTVARI</span>{' '}
            <em className="hero-heading-script">svojo Vizijo</em>
          </h1>

          <div className="hero-divider" />

          <p className="hero-quote">
            &ldquo;Vaša domišljija je naš platno. Ustvarjajte brez omejitev.&rdquo;
          </p>

          {/* Hero action areas */}
          <div className="hero-actions">
            {/* AI Create box */}
            <div
              className="action-box action-box--create"
              onClick={() => navigate('/studio', { state: { mode: 'create' } })}
            >
              <div className="action-icon action-icon--create">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="action-title">Ustvari z AI</h3>
              <p className="action-desc">
                Opišite vizijo z ključnimi besedami — AI ustvari umetnino
              </p>
              <span className="action-btn btn-gold">ZAČNI USTVARJATI</span>
            </div>

            {/* Upload box */}
            <div
              className={`action-box action-box--upload ${isDragging ? 'action-box--dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="action-title">Naloži Sliko</h3>
              <p className="action-desc">
                Naložite referenco — AI ustvari umetnino po vaši meri
              </p>
              <p className="upload-formats">
                JPG, PNG &bull; MAX 20MB
              </p>
              <div className="upload-buttons">
                <button className="btn-gold" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                  IZBERI SLIKO
                </button>
                <button className="btn-gold" onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}>
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </span>
                  FOTOAPARAT
                </button>
              </div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png" hidden onChange={handleFileSelect} />
            </div>
          </div>
        </div>
      </div>

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(dataUrl) => {
          setShowCamera(false);
          navigate('/studio', {
            state: { image: dataUrl, fileName: 'camera-capture.jpg' },
          });
        }}
      />
    </section>
  );
}
