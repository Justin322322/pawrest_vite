import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { faqs } from '@shared/schema';

export function FAQSection() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  
  const { data: faqData, isLoading } = useQuery({
    queryKey: ['/api/faqs'],
    initialData: faqs
  });

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-neutral-600 text-lg">Find answers to common questions about our pet memorial services.</p>
        </div>
        
        <div className="max-w-3xl mx-auto divide-y divide-neutral-200">
          {faqData?.map((faq) => (
            <div key={faq.id} className="py-6">
              <button 
                className="flex w-full items-start justify-between text-left"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={openFaqId === faq.id}
              >
                <h3 className="font-medium text-lg text-neutral-800">{faq.question}</h3>
                <span className="ml-6 text-primary-500 flex-shrink-0">
                  {openFaqId === faq.id ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </button>
              <div className={`mt-3 text-neutral-600 ${openFaqId === faq.id ? 'block' : 'hidden'}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-neutral-600 mb-4">Can't find the answer you're looking for?</p>
          <Button className="bg-primary-500 hover:bg-primary-600 text-white">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
}
