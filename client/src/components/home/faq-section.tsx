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

        {/* Support section - resized to match FAQ width */}
        <div className="mt-16 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-primary-50 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-neutral-800">Can't find the answer you're looking for?</h3>
              <p className="text-neutral-500 text-sm">Our support team is here to help</p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-primary-600 text-primary-600 hover:bg-primary-50 font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            <Link href="/contact">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
