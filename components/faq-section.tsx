'use client';

import { useVisibleFAQs } from '@/lib/hooks/use-faqs';

export default function FAQSection() {
  const { data: faqs, isLoading, error } = useVisibleFAQs();

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-8 animate-pulse">
                <div className="h-5 bg-muted rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary/30 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-12">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
              <p className="text-muted-foreground text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
