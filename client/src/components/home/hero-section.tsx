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
        backgroundPosition: '85% center',
      }}
    >
      {/* Black gradient only on the left side, stronger and more coverage */}
      <div className="absolute inset-0 pointer-events-none flex">
        <div className="w-2/3 h-full bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        <div className="flex-1"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl animate-fade-in pl-0 md:pl-4 lg:pl-8">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl">
            Honor Their Memory with Dignity & Love
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl font-medium drop-shadow">
            We provide compassionate memorial services for your beloved pets, helping you celebrate the joy they brought to your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold shadow-lg border-2 border-white/80"
            >
              <Link href="#services">
                Explore Our Services
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/80 hover:bg-white text-blue-900 border border-gray-300 font-semibold shadow"
            >
              <Link href="#how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white/90 animate-bounce drop-shadow-lg">
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
