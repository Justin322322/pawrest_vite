import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Find Services",
      description: "Browse through our vetted memorial service providers in your area and choose the right one for your needs."
    },
    {
      number: 2,
      title: "Book & Schedule",
      description: "Select your preferred services, choose a date and time, and receive instant confirmation from the provider."
    },
    {
      number: 3,
      title: "Honor & Remember",
      description: "Experience a compassionate memorial service that celebrates your pet's unique personality and the joy they brought."
    }
  ];

  const providerBenefits = [
    "Easy business profile setup and management",
    "Showcase your services and availability",
    "Streamlined booking and client management",
    "Built-in payment processing system"
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-800 mb-4">How PawRest Works</h2>
          <p className="text-neutral-600 text-lg">Simple steps to honor your pet's memory with care and compassion.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-600 text-xl font-semibold">{step.number}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-800 mb-3">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-neutral-50 rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex items-center">
              <div>
                <h3 className="font-display text-2xl font-semibold text-neutral-800 mb-4">For Service Providers</h3>
                <p className="text-neutral-600 mb-6">Are you a pet memorial service provider? Join our platform to reach more pet parents in need of your compassionate services.</p>
                <ul className="space-y-3 mb-8">
                  {providerBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="text-primary-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-neutral-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild
                  className="bg-secondary-500 hover:bg-secondary-600 text-white"
                >
                  <Link href="/auth">
                    Join as a Provider
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img 
                className="absolute inset-0 w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="Service provider caring for pets" 
                onError={(e) => {
                  // Fallback image if the primary one fails to load
                  e.currentTarget.src = "https://images.unsplash.com/photo-1575859431774-2e57ed632664?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
