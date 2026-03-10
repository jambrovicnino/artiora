import Hero from '../components/home/Hero';
import MarketplaceHighlight from '../components/marketplace/MarketplaceHighlight';
import FeaturedArtists from '../components/marketplace/FeaturedArtists';
import AboutSection from '../components/home/AboutSection';
import ProcessSection from '../components/home/ProcessSection';
import GallerySection from '../components/home/GallerySection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ServicesSection from '../components/home/ServicesSection';
import CTASection from '../components/home/CTASection';
import ScrollReveal from '../components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <ScrollReveal variant="fade-in">
        <Hero />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <MarketplaceHighlight />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={60}>
        <FeaturedArtists />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <AboutSection />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={60}>
        <ProcessSection />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <GallerySection />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <TestimonialsSection />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" stagger>
        <ServicesSection />
      </ScrollReveal>

      <ScrollReveal variant="fade-up">
        <CTASection />
      </ScrollReveal>
    </>
  );
}
