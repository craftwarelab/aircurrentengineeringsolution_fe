'use client';

import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <>
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

            {/* Google Maps Location */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border overflow-hidden h-full">
                <div className="p-6 border-b border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Visit Our Office</h2>
                  <p className="text-muted-foreground">Colombo 7, Sri Lanka</p>
                </div>
                <div className="relative w-full h-[450px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.866!2d79.861!3d6.927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593f3f3f3f3f%3A0x3f3f3f3f3f3f3f3f!2sColombo%207!5e0!3m2!1sen!2slk!4v1710000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

    </>
  );
}
