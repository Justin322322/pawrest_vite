import { Navbar } from '@/components/layout/navbar';
import { HeroSection } from '@/components/home/hero-section';
import { TrustBadges } from '@/components/home/trust-badges';
import { ServicesSection } from '@/components/home/services-section';
import { ParallaxCTA } from '@/components/home/parallax-cta';
import { HowItWorks } from '@/components/home/how-it-works';
import { Testimonials } from '@/components/home/testimonials';
import { FAQSection } from '@/components/home/faq-section';
import { CallToAction } from '@/components/home/call-to-action';
import { useEffect } from 'react';

export default function HomePage() {
  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();

        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId as string);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - 80, // Adjust for navbar height
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <TrustBadges />
        <ServicesSection />
        <ParallaxCTA />
        <HowItWorks />
        <Testimonials />
        <FAQSection />
        <CallToAction />
      </main>
    </div>
  );
}
