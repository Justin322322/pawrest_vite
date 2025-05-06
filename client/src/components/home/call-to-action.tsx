import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="py-16 bg-blue-600 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Honor Their Memory Today
          </h2>
          <p className="text-white text-lg mb-8">
            Connect with compassionate service providers who understand that pets are family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg text-base"
            >
              <Link href="/services" className="flex items-center">
                Find Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-semibold shadow-lg text-base border-0"
            >
              <Link href="/provider/register">
                Become a Provider
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
