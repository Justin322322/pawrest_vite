import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Honor Their Memory Today</h2>
          <p className="text-white/90 text-lg mb-8">
            Connect with compassionate service providers who understand that pets are family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-white text-primary-600 hover:bg-neutral-100"
            >
              <Link href="/auth">
                Find Services
              </Link>
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border border-white text-white hover:bg-white/10"
            >
              <Link href="/auth">
                Become a Provider
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
