'use client';

import HeroSection from '@/components/hero-section';
import ContactForm from '@/components/contact-form';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useVisibleFAQs } from '@/lib/hooks/use-faqs';

function FAQSection() {
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

export default function Contact() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Get in Touch"
        subtitle="Contact Us"
        description="Ready to discuss your HVAC and ventilation needs? Our team is here to help. Contact us today for a free consultation."
      />

      {/* Main Contact Section */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                  <p className="text-muted-foreground">+94 70 153 3195</p>
                  <p className="text-sm text-muted-foreground">Available 24/7 for emergencies</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">info@aircurrentengineeringsolution.com</p>
                  <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Address</h3>
                  <p className="text-muted-foreground">Colombo 7</p>
                  {/* <p className="text-muted-foreground">Tech City, TC 12345</p> */}
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                  <p className="text-muted-foreground">Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">Sat: 9:00 AM - 2:00 PM</p>
                  <p className="text-sm text-muted-foreground">Emergency service 24/7</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Service Areas */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Service Area</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            We serve commercial and industrial facilities throughout a 5-state region, with particular expertise 
            in the metropolitan area. For facilities outside our primary service area, we can recommend trusted partners.
          </p>
          
          <div className="bg-secondary/30 rounded-lg p-8 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Primary Service Region:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="text-accent font-bold mt-1">•</span>
                <span>Metropolitan Area - 24 hour service</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent font-bold mt-1">•</span>
                <span>Regional Coverage - 200 mile radius</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent font-bold mt-1">•</span>
                <span>Specialized Projects - Beyond service area available</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-muted-foreground mb-4">
                &quot;Air Current Eng. Solutions designed and installed our HVAC system perfectly. Their expertise and attention 
                to detail resulted in a system that exceeds our expectations. Highly recommended.&quot;
              </p>
              <p className="font-semibold text-foreground">Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">Facilities Director, Modern Office Complex</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-muted-foreground mb-4">
                &quot;The energy savings from their optimization recommendations were immediate and significant. 
                We&apos;ve reduced our HVAC operating costs by over 30% in the first year alone.&quot;
              </p>
              <p className="font-semibold text-foreground">Michael Chen</p>
              <p className="text-sm text-muted-foreground">Operations Manager, Manufacturing Facility</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-muted-foreground mb-4">
                &quot;Their 24/7 emergency service has been invaluable. When we had a critical system failure, 
                they responded immediately and got us back up and running within hours.&quot;
              </p>
              <p className="font-semibold text-foreground">Dr. Patricia Williams</p>
              <p className="text-sm text-muted-foreground">Facilities Manager, Metropolitan Hospital</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
