import Link from 'next/link';
import { ArrowRight, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/hero-section';
import FeatureCard from '@/components/feature-card';
import { getServices, getProducts, getProjects } from '@/lib/mockDatabase';

export default function Home() {
  const services = getServices().slice(0, 4);
  const projects = getProjects().slice(0, 3);

  const stats = [
    { value: '500+', label: 'Projects Completed' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '20+', label: 'Years Experience' },
    { value: '150+', label: 'Team Members' },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Energy Efficient',
      description: 'Reduce energy consumption by up to 35% with our optimized HVAC solutions.',
    },
    {
      icon: Shield,
      title: 'Reliable Systems',
      description: 'Built to withstand demanding conditions with industry-leading warranty coverage.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Certified engineers with decades of combined experience in HVAC design.',
    },
    {
      icon: TrendingUp,
      title: 'Future Ready',
      description: 'Smart controls and IoT integration for maximum system optimization.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Professional HVAC & Ventilation Solutions"
        subtitle="Engineering Excellence"
        description="Air Current Engineering delivers cutting-edge HVAC and ventilation systems tailored to your facility's unique needs. From design through installation and maintenance, we ensure optimal comfort and efficiency."
        ctaText="Request a Consultation"
        ctaHref="/contact"
        secondaryCtaText="View Our Services"
        secondaryCtaHref="/services"
        variant="home"
      />

      {/* Key Metrics Section */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-foreground/70 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
              Why Choose Us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              We combine technical expertise with customer-focused service to deliver solutions that exceed expectations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                  Our Services
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Comprehensive HVAC solutions for every need.
                </p>
              </div>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link href="/services">
                  View All <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <FeatureCard
                key={service.id}
                title={service.name}
                description={service.description}
                category={service.category}
                details={service.details}
              />
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                  Recent Projects
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  See what we have accomplished for our clients.
                </p>
              </div>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link href="/projects">
                  View All <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <FeatureCard
                key={project.id}
                title={project.title}
                description={project.description}
                industry={project.industry}
                client={project.client}
              />
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
            Ready to Optimize Your HVAC System?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact our engineering team today for a free consultation and discover how we can improve your facility&apos;s comfort and efficiency.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/contact">Get Your Free Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
