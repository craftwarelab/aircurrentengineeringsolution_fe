import HeroSection from '@/components/hero-section';
import FeatureCard from '@/components/feature-card';
import { getServices } from '@/lib/mockDatabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Services() {
  const services = getServices();
  
  const categories = [...new Set(services.map(s => s.category))];
  const servicesByCategory: Record<string, typeof services> = {};
  
  categories.forEach(cat => {
    servicesByCategory[cat] = services.filter(s => s.category === cat);
  });

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Our Services"
        subtitle="Comprehensive Solutions"
        description="From system design and installation to maintenance and optimization, we provide complete HVAC solutions tailored to your facility's specific needs."
      />

      {/* Services Grid */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-foreground mb-8">{category} Services</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {servicesByCategory[category].map((service) => (
                    <FeatureCard
                      key={service.id}
                      title={service.name}
                      description={service.description}
                      category={service.category}
                      details={service.details}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Our Approach</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-accent mb-3">01</div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Assessment</h3>
              <p className="text-muted-foreground">
                We begin with a comprehensive evaluation of your facility&apos;s current system, 
                operational requirements, and performance goals. This detailed analysis forms the 
                foundation for all recommendations.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-accent mb-3">02</div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Design</h3>
              <p className="text-muted-foreground">
                Our engineers develop customized solutions using advanced CAD and analysis tools. 
                Every design is optimized for efficiency, reliability, and compliance with industry 
                standards.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-accent mb-3">03</div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Implementation</h3>
              <p className="text-muted-foreground">
                Our certified technicians execute the project with minimal disruption to your operations. 
                We maintain rigorous quality standards throughout installation and testing phases.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-accent mb-3">04</div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Optimization</h3>
              <p className="text-muted-foreground">
                After commissioning, we provide ongoing support and optimization services to ensure 
                your system operates at peak efficiency for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why These Services */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Why Choose Our Services?</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            Our comprehensive service offerings ensure you have a single trusted partner for all your HVAC needs, 
            from initial design through long-term maintenance and optimization.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Integrated Solutions',
                desc: 'All services from one provider reduces coordination challenges and ensures system compatibility.',
              },
              {
                title: 'Cost Effectiveness',
                desc: 'Streamlined processes and long-term partnerships result in better pricing for comprehensive packages.',
              },
              {
                title: 'Performance Accountability',
                desc: 'We stand behind our work with comprehensive warranties and ongoing performance monitoring.',
              },
              {
                title: 'Proactive Maintenance',
                desc: 'Regular maintenance programs prevent costly breakdowns and extend system lifespan.',
              },
              {
                title: 'Emergency Support',
                desc: '24/7 emergency response ensures your facility stays operational when you need it most.',
              },
              {
                title: 'Energy Optimization',
                desc: 'Advanced analytics and controls help you continuously reduce operating costs.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
            Let&apos;s Find the Right Solution for Your Facility
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact our engineering team to discuss your specific needs and learn how our services can 
            improve your facility&apos;s comfort, efficiency, and reliability.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/contact">Request a Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
