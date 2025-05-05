import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { testimonials } from '@shared/schema';

export function Testimonials() {
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['/api/testimonials'],
    initialData: testimonials
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <section id="testimonials" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-800 mb-4">What Pet Parents Are Saying</h2>
          <p className="text-neutral-600 text-lg">Hear from families who have found comfort through our services.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviewData?.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="text-yellow-400 flex">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="ml-2 text-neutral-600 text-sm">{testimonial.rating.toFixed(1)}</span>
              </div>
              <blockquote className="mb-6">
                <p className="text-neutral-700 italic">"{testimonial.text}"</p>
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.author} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800">{testimonial.author}</h4>
                  <p className="text-neutral-500 text-sm">{testimonial.petName}'s {testimonial.author.includes('J') ? 'Dad' : 'Mom'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-primary-500 text-primary-500 hover:bg-primary-50"
          >
            Read More Testimonials
          </Button>
        </div>
      </div>
    </section>
  );
}
