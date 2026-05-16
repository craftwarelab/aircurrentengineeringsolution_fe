'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisibleTestimonials, Testimonial } from '@/lib/hooks/use-testimonials';

export default function TestimonialsSection() {
  const { data: testimonials = [], isLoading, error } = useVisibleTestimonials();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    if (testimonials.length <= 3) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 3 : prevIndex - 1
    );
  };

  const goToNext = () => {
    if (testimonials.length <= 3) return;
    setCurrentIndex((prevIndex) =>
      prevIndex >= testimonials.length - 3 ? 0 : prevIndex + 1
    );
  };

  if (isLoading) {
    return (
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
              What Our Clients Say
            </h2>
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 bg-card rounded-lg p-6 border border-border animate-pulse">
                <div className="h-8 w-8 bg-muted rounded mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                What Our Clients Say
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Hear from the organizations we've helped achieve optimal climate control.
              </p>
            </div>
            {testimonials.length > 3 && (
              <div className="hidden sm:flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {testimonials.map((testimonial: Testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-card rounded-lg p-6 border border-border"
              >
                <Quote className="w-8 h-8 text-accent mb-4" />
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  "{testimonial.message}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.customer_position ? `${testimonial.customer_position}, ` : ''}{testimonial.company_name || ''}
                    </p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-accent">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > 3 && (
          <div className="flex sm:hidden justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
