import services from '../../data/services';
import ServiceCard from './ServiceCard';
import './ServicesSection.css';

export default function ServicesSection() {
  return (
    <section id="services" className="services">
      <div className="container">
        <div className="services-grid">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
