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
      {/* Floating gold leaves */}
      <HeroLeaves />

      <div className="container">
        <div className="hero-content">
          <p className="hero-established">UST. 2024</p>

          <h1 className="hero-heading">
            <span className="hero-heading-main">OŽIVITE</span>{' '}
            <em className="hero-heading-script">Spomine</em>
          </h1>

          <div className="hero-divider" />

          <p className="hero-quote">
            &ldquo;Ohranjanje elegance preteklosti z inteligenco prihodnosti.&rdquo;
          </p>

          {/* Upload area */}
          <div className="hero-upload">
            <div
              className={`upload-box ${isDragging ? 'upload-box--dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <h3 className="upload-title">Naložite Fotografijo</h3>

              <p className="upload-quote">
                &ldquo;Vsaka slika pripoveduje zgodbo. Dovolite nam, da jo jasno povemo.&rdquo;
              </p>

              <p className="upload-formats">
                POVLECITE SEM ALI KLIKNITE &bull; JPG, PNG &bull; MAX 20MB
              </p>

              <div className="upload-buttons">
                <button
                  className="btn-gold"
                  onClick={() => inputRef.current?.click()}
                >
                  IZBERI FOTOGRAFIJO
                </button>
                <button
                  className="btn-gold"
                  onClick={() => setShowCamera(true)}
                >
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </span>
                  ODPRI FOTOAPARAT
                </button>
                <button className="btn-outline" onClick={handleViewExample}>
                  POGLEJ PRIMER
                </button>
              </div>

              {/* File picker input */}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                hidden
                onChange={handleFileSelect}
              />
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
