import BeforeAfterSlider from '../components/studio/BeforeAfterSlider';
import { galleryItems } from '../data/galleryItems';
import CTASection from '../components/home/CTASection';
import './GalleryPage.css';

export default function GalleryPage() {
  const featuredItems = galleryItems.filter((item) => item.isFeatured);
  const placeholderItems = galleryItems.filter((item) => item.isPlaceholder);

  const familyItem = featuredItems.find((item) => item.id === 'featured-1');
  const weddingItem = featuredItems.find((item) => item.id === 'featured-2');

  return (
    <div className="gallery-page">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label">ETERNA</span>
          <h1 className="page-hero-heading">Galerija Obnovljenih Spominov</h1>
          <p className="page-hero-subtitle">Oglejte si primere naših restavracij in barvanj</p>
        </div>
      </div>

      {/* Featured Showcase — Family Portrait */}
      {familyItem && (
        <section className="gallery-showcase">
          <div className="container">
            <div className="showcase-header">
              <span className="showcase-label">IZPOSTAVLJENA OBNOVITEV</span>
              <h2 className="showcase-title">Družinski Portret — Pred in Po</h2>
              <p className="showcase-description">
                Izvirnik iz leta 1960 · Restavracija + Barvanje z umetno inteligenco
              </p>
            </div>

            <div className="showcase-slider-wrapper" data-cursor="brush">
              <BeforeAfterSlider
                originalImage={familyItem.src}
                processedImage={familyItem.srcAfter}
              />
            </div>

            {/* Framed Result */}
            {familyItem.srcFramed && (
              <div className="showcase-framed">
                <div className="showcase-framed-card">
                  <img
                    src={familyItem.srcFramed}
                    alt="Končni izdelek — družinski portret na platnu z zlatim okvirjem"
                    className="showcase-framed-image"
                    loading="lazy"
                  />
                  <div className="showcase-framed-info">
                    <span className="showcase-framed-badge">KONČNI IZDELEK</span>
                    <h3 className="showcase-framed-title">Premium Platno z Zlatim Okvirjem</h3>
                    <p className="showcase-framed-detail">
                      {familyItem.size} · Impasto gel medij · UV-odporne barve
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Secondary Showcase — Wedding Photo */}
      {weddingItem && (
        <section className="gallery-showcase gallery-showcase-alt">
          <div className="container">
            <div className="showcase-header">
              <span className="showcase-label">OBNOVITEV #2</span>
              <h2 className="showcase-title">Poročna Fotografija — Pred in Po</h2>
              <p className="showcase-description">
                Izvirnik iz leta 1965 · Restavracija + Barvanje z umetno inteligenco
              </p>
            </div>

            <div className="showcase-slider-wrapper" data-cursor="brush">
              <BeforeAfterSlider
                originalImage={weddingItem.src}
                processedImage={weddingItem.srcAfter}
              />
            </div>

            {/* Framed Result */}
            {weddingItem.srcFramed && (
              <div className="showcase-framed">
                <div className="showcase-framed-card">
                  <img
                    src={weddingItem.srcFramed}
                    alt="Končni izdelek — poročna fotografija na platnu z okvirjem"
                    className="showcase-framed-image"
                    loading="lazy"
                  />
                  <div className="showcase-framed-info">
                    <span className="showcase-framed-badge">KONČNI IZDELEK</span>
                    <h3 className="showcase-framed-title">Premium Platno z Okvirjem</h3>
                    <p className="showcase-framed-detail">
                      {weddingItem.size} · Impasto gel medij · UV-odporne barve
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Placeholder Grid — Coming Soon Items */}
      {placeholderItems.length > 0 && (
        <section className="gallery-grid-section">
          <div className="container">
            <div className="gallery-grid-header">
              <h2 className="gallery-grid-heading">Več Primerov Kmalu</h2>
              <p className="gallery-grid-subtitle">
                Naša galerija se nenehno širi z novimi obnovitvami
              </p>
            </div>

            <div className="gallery-page-grid">
              {placeholderItems.map((item) => (
                <div className="gallery-page-card" key={item.id}>
                  <div className="gallery-page-image-container">
                    <img
                      className="gallery-page-image"
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                    />
                    <span className="gallery-page-badge">KMALU</span>
                    <div className="gallery-page-overlay">
                      <span className="gallery-page-overlay-title">{item.title}</span>
                      <span className="gallery-page-overlay-size">{item.size}</span>
                      <span className="gallery-page-overlay-enhancement">{item.enhancement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}
