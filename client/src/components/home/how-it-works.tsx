import { Link } from 'wouter';
import { Check, Search, Calendar, Heart, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Find Services",
      description: "Browse through our vetted memorial service providers in your area and choose the right one for your needs.",
      icon: <Search className="h-6 w-6 text-neutral-800" />
    },
    {
      number: 2,
      title: "Book & Schedule",
      description: "Select your preferred services, choose a date and time, and receive instant confirmation from the provider.",
      icon: <Calendar className="h-6 w-6 text-neutral-800" />
    },
    {
      number: 3,
      title: "Honor & Remember",
      description: "Experience a compassionate memorial service that celebrates your pet's unique personality and the joy they brought.",
      icon: <Heart className="h-6 w-6 text-neutral-800" />
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-800 mb-2">How PawRest Works</h2>
          <p className="text-neutral-600 text-base">Simple steps to honor your pet's memory with care and compassion.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-100">
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center">
                  <span className="text-neutral-800 text-xl font-bold">{step.number}</span>
                </div>
                {step.icon}
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">{step.title}</h3>
              <p className="text-neutral-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 flex items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-neutral-50 p-2 rounded-full mr-3">
                    <Megaphone className="text-neutral-800 h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="inline-block bg-neutral-50 text-neutral-700 px-4 py-1 rounded-full text-sm font-semibold">For Professionals</div>
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-800 mb-3">For Service Providers</h3>
                <p className="text-neutral-600 text-sm mb-6">Are you a pet memorial service provider? Join our platform to reach more pet parents in need of your compassionate services.</p>
                <ul className="space-y-3 mb-6">
                  {providerBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-neutral-50 p-1 rounded-full mr-3 mt-0.5">
                        <Check className="text-neutral-800 h-4 w-4 flex-shrink-0" />
                      </div>
                      <span className="text-neutral-700 text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
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
