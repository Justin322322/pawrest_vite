import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useParallax } from '@/hooks/use-parallax';

export function ParallaxCTA() {
  const { ref } = useParallax<HTMLDivElement>(0.3);

  return (
    <section 
      ref={ref}
      className="relative py-20"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">They're Family, Not Just Pets</h2>
          <p className="text-white/90 text-lg mb-8">
            Our companions leave paw prints on our hearts. Honor their memory with the dignified farewell they deserve.
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-white text-primary-600 hover:bg-neutral-100"
          >
            <Link href="#">
              Find a Provider Near You
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
