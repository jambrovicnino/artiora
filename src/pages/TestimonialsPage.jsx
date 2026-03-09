import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';
import ScrollReveal from '../components/ScrollReveal';
import './TestimonialsPage.css';

const EXTENDED_TESTIMONIALS = [
  {
    id: 101,
    name: 'Petra M.',
    initials: 'PM',
    rating: 5,
    quote:
      'Našla sem staro fotografijo mojega dedka v uniformi iz leta 1940. Eterna jo je obnovila do potankosti — vsak gumb, vsaka senca. Ko sem videla rezultat na platnu, sem jokala od sreče. Hvala vam!',
    service: 'Restavracija + Premium platno',
  },
  {
    id: 102,
    name: 'Janez L.',
    initials: 'JL',
    rating: 5,
    quote:
      'Za 50. obletnico poroke staršev sem naročil obnovitev njune poročne fotografije. Platno z Impasto gel medijem izgleda kot prava slika. Mama je bila tako ganjena, da je besede niso zmogle.',
    service: 'Barvanje + Zlati okvir',
  },
  {
    id: 103,
    name: 'Nina T.',
    initials: 'NT',
    rating: 5,
    quote:
      'Profesionalna ekipa, hitra komunikacija in izjemen rezultat. Fotografija iz leta 1955 je zdaj v barvah in izgleda neverjetno naravno. Naročila sem še tri za celotno družino!',
    service: 'Barvanje + Dostava',
  },
];

function StarRating({ count }) {
  return (
    <div className="testimonial-stars">
      {'★'.repeat(count)}
    </div>
  );
}

function ExtendedTestimonialCard({ testimonial }) {
  const { name, initials, rating, quote, service } = testimonial;

  return (
    <div className="testimonial-card">
      <span className="testimonial-quote-mark">&ldquo;</span>
      <p className="testimonial-quote">{quote}</p>
      <StarRating count={rating} />
      <div className="testimonial-divider" />
      <div className="testimonial-author">
        <div className="testimonial-avatar">{initials}</div>
        <div className="testimonial-info">
          <span className="testimonial-name">{name}</span>
          <span className="testimonial-service">{service}</span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div className="testimonials-page">
      <ScrollReveal variant="fade-in">
        <div className="page-hero">
          <div className="container">
            <span className="page-hero-label">ETERNA</span>
            <h1 className="page-hero-heading">Mnenja Strank</h1>
            <p className="page-hero-subtitle">Kaj pravijo naši zadovoljni naročniki</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <TestimonialsSection />
      </ScrollReveal>

      <section className="testimonials-extended">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <div className="testimonials-extended-header">
              <h2 className="testimonials-extended-heading">Še Več Mnenj</h2>
              <p className="testimonials-extended-subtitle">
                Vsaka zgodba je unikatna — tako kot vsaka fotografija, ki jo obnovimo
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" stagger>
            <div className="testimonials-extended-grid">
              {EXTENDED_TESTIMONIALS.map((t) => (
                <ExtendedTestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal variant="fade-up" stagger>
        <section className="testimonials-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">500+</span>
                <span className="stat-label">Obnovljenih Fotografij</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">98%</span>
                <span className="stat-label">Zadovoljnih Strank</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">5.0</span>
                <span className="stat-label">Povprečna Ocena</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">5 dni</span>
                <span className="stat-label">Povprečna Dostava</span>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <CTASection />
      </ScrollReveal>
    </div>
  );
}
