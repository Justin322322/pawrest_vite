import { Link } from 'wouter';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParallax } from '@/hooks/use-parallax';

export function HeroSection() {
  const { ref } = useParallax<HTMLDivElement>(0.5);

  return (
    <section 
      ref={ref}
      className="relative h-[80vh] flex items-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/70 to-secondary-900/70"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow">
            Honor Their Memory with Dignity & Love
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            We provide compassionate memorial services for your beloved pets, helping you celebrate the joy they brought to your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild
              size="lg"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium"
            >
              <Link href="#services">
                Explore Our Services
              </Link>
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 font-medium"
            >
              <Link href="#how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white/80 animate-bounce">
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
