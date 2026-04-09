import HeroSection from '@/components/hero-section';
import FeatureCard from '@/components/feature-card';
import { getProjects } from '@/lib/mockDatabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Projects() {
  const projects = getProjects();
  
  const industries = [...new Set(projects.map(p => p.industry))];
  const projectsByIndustry: Record<string, typeof projects> = {};
  
  industries.forEach(industry => {
    projectsByIndustry[industry] = projects.filter(p => p.industry === industry);
  });

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Our Projects"
        subtitle="Success Stories"
        description="See how we have delivered exceptional HVAC and ventilation solutions for leading organizations across various industries."
      />

      {/* Projects Grid */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {industries.map((industry) => (
              <div key={industry}>
                <h2 className="text-2xl font-bold text-foreground mb-8">{industry}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectsByIndustry[industry].map((project) => (
                    <FeatureCard
                      key={project.id}
                      title={project.title}
                      description={project.description}
                      industry={project.industry}
                      client={project.client}
                      results={project.results}
                      details={project.scope}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Highlights */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Why Our Projects Stand Out</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Custom Solutions</h3>
              <p className="text-muted-foreground">
                Every project is unique. We develop custom solutions tailored to each client&apos;s specific 
                requirements, operating conditions, and long-term goals.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Proven Results</h3>
              <p className="text-muted-foreground">
                Our projects deliver measurable results: energy savings, improved comfort, enhanced air 
                quality, and extended equipment lifespan.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Professional Execution</h3>
              <p className="text-muted-foreground">
                From initial design through final commissioning, our team maintains the highest standards 
                of quality and professionalism throughout every phase.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Client Partnerships</h3>
              <p className="text-muted-foreground">
                We treat every project as a partnership, working closely with our clients to ensure their 
                vision is realized and expectations are exceeded.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Multi-Industry Expertise</h3>
              <p className="text-muted-foreground">
                Our portfolio spans commercial offices, healthcare facilities, manufacturing plants, 
                educational institutions, and specialized applications.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Sustainability Impact</h3>
              <p className="text-muted-foreground">
                We design energy-efficient systems that reduce operating costs and environmental impact, 
                supporting our clients&apos; sustainability goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Statistics */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">By the Numbers</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-4xl font-bold text-primary mb-2">500+</p>
              <p className="text-foreground font-semibold">Projects Completed</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-4xl font-bold text-primary mb-2">98%</p>
              <p className="text-foreground font-semibold">Client Satisfaction</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-4xl font-bold text-primary mb-2">$2.5B</p>
              <p className="text-foreground font-semibold">Total Project Value</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-4xl font-bold text-primary mb-2">35%</p>
              <p className="text-foreground font-semibold">Avg Energy Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Industries We Serve</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            Our multi-industry experience means we understand the unique challenges and requirements of 
            different sectors, from sensitive healthcare environments to demanding industrial facilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <div key={industry} className="bg-card border border-border rounded-lg p-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">{industry}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {industry === 'Healthcare' && 'Advanced air quality systems for patient safety and regulatory compliance'}
                  {industry === 'Commercial Real Estate' && 'Efficient climate control for office complexes and retail spaces'}
                  {industry === 'Manufacturing' && 'Industrial-grade solutions for production environments and safety'}
                  {industry === 'Education' && 'Campus-wide systems supporting learning and research environments'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study CTA */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready to See What We Can Do?</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            Whether you&apos;re planning a new facility, upgrading existing systems, or addressing specific 
            challenges, our team has the expertise to deliver results. Let&apos;s discuss your project.
          </p>
          
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/contact">Start Your Project</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
            Your Next Success Story Starts Here
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact our team to discuss your project needs and learn how we can help you achieve your 
            facility goals with proven HVAC and ventilation solutions.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/contact">Request a Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
