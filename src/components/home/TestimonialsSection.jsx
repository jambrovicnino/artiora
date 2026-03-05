import testimonials from '../../data/testimonials';
import './TestimonialsSection.css';

function StarRating({ count }) {
  return (
    <div className="testimonial-stars">
      {'★'.repeat(count)}
    </div>
  );
}

function TestimonialCard({ testimonial }) {
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

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <span className="testimonials-label">MNENJA</span>
          <h2 className="testimonials-heading">Zadovoljne Stranke</h2>
          <p className="testimonials-subtitle">
            Kaj pravijo naši naročniki
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
