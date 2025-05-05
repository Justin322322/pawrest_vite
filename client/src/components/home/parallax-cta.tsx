import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useParallax } from '@/hooks/use-parallax';

export function ParallaxCTA() {
  const { ref } = useParallax<HTMLDivElement>(0.3);

  return (
    <section 
      ref={ref}
      className="relative py-20 overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, // Cat image
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed', // Parallax effect
      }}
    >
      {/* Strong left-side black gradient for text clarity */}
      <div className="absolute inset-0 pointer-events-none flex">
        <div className="w-2/3 h-full bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        <div className="flex-1"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-left md:text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-xl">They're Family, Not Just Pets</h2>
          <p className="text-white/90 text-lg mb-8 drop-shadow">
            Our companions leave paw prints on our hearts. Honor their memory with the dignified farewell they deserve.
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-white text-primary-600 hover:bg-neutral-100 font-semibold shadow-lg border-2 border-white/80"
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
