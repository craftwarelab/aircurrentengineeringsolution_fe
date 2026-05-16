'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Facility Manager",
    company: "TechCorp Industries",
    content: "Air Current Engineering transformed our HVAC system. The energy savings have been remarkable, and our team is more comfortable than ever.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Operations Director",
    company: "Metro Hospital",
    content: "Their expertise in medical facility ventilation is unmatched. The installation was seamless and our air quality has never been better.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "CEO",
    company: "Green Manufacturing",
    content: "Professional, responsive, and innovative. They delivered a custom solution that exceeded our expectations on time and within budget.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Plant Manager",
    company: "Precision Electronics",
    content: "The smart controls integration has given us unprecedented visibility into our climate systems. Highly recommend their services.",
    rating: 5,
  },
  {
    id: 5,
    name: "Amanda Foster",
    role: "Facilities Director",
    company: "University Campus",
    content: "Working with Air Current has been a pleasure. Their team is knowledgeable, reliable, and always goes the extra mile.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 3 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= testimonials.length - 3 ? 0 : prevIndex + 1
    );
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

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
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-card rounded-lg p-6 border border-border"
              >
                <Quote className="w-8 h-8 text-accent mb-4" />
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-accent">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
      </div>
    </section>
  );
}
