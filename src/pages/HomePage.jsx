import Hero from '../components/home/Hero';
import AboutSection from '../components/home/AboutSection';
import ProcessSection from '../components/home/ProcessSection';
import GallerySection from '../components/home/GallerySection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ServicesSection from '../components/home/ServicesSection';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ProcessSection />
      <GallerySection />
      <TestimonialsSection />
      <ServicesSection />
      <CTASection />
    </>
  );
}
