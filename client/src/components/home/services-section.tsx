import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { serviceTypes } from '@shared/schema';

export function ServicesSection() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services'],
    initialData: serviceTypes
  });

  return (
    <section id="services" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-800 mb-4">Our Memorial Services</h2>
          <p className="text-neutral-600 text-lg">Choose from a variety of compassionate services to honor your beloved pet's memory in the most meaningful way.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service) => (
            <Card 
              key={service.id}
              className="overflow-hidden transition-all duration-300 hover:translate-y-[-5px] shadow-md"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105" 
                  src={service.imageUrl} 
                  alt={service.name} 
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-neutral-800 mb-2">{service.name}</h3>
                <p className="text-neutral-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-medium">From ${service.price}</span>
                  <Link href="#" className="text-secondary-500 hover:text-secondary-700 font-medium flex items-center">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" className="border-primary-500 text-primary-500 hover:bg-primary-50">
            View All Services <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
