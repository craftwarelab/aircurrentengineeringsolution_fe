'use client';

import HeroSection from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProjects } from '@/lib/hooks/use-projects';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

export default function Projects() {
  // Fetch real projects from API (only active ones)
  // Fetch projects from API.
  // Temporarily fetching without status filter so we can see if any projects exist at all.
  // You can later filter to only 'active' once you have projects with status=active.
  const { data: projectsResponse, isLoading, error } = useProjects(1, 50);

  // === DEBUG: See exactly what SWR is giving us ===
  if (typeof window !== 'undefined') {
    console.log('%c[Public Projects] Raw projectsResponse:', 'color: #0af; font-weight: bold', projectsResponse);
  }

  const raw = projectsResponse as any;

  let allProjects: any[] = [];

  if (raw) {
    // Most common after global SWR fetcher:
    // raw = { data: [projects...], total, page, last_page }
    if (Array.isArray(raw.data)) {
      allProjects = raw.data;
    } 
    // Full response somehow came through
    else if (raw.data && Array.isArray(raw.data.data)) {
      allProjects = raw.data.data;
    } 
    // Direct array
    else if (Array.isArray(raw)) {
      allProjects = raw;
    }
  }

  // Only show active projects on public site
  const projects = allProjects.filter((p: any) => p.status === 'active');

  // For now we show a flat list (tags can be used for filtering later)
  // If you want grouping by tags in future, we can add it.

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
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our portfolio of successfully delivered HVAC, ventilation, and air quality projects.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Failed to load projects. Please try again later.
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-3 border border-dashed rounded-lg p-8">
              <p className="font-medium">No active projects found on the public page.</p>
              
              <div className="text-left text-xs bg-muted p-3 rounded font-mono max-w-md mx-auto">
                <div>Raw response received: {raw ? 'Yes' : 'No (undefined/null)'}</div>
                <div>allProjects.length: {Array.isArray(allProjects) ? allProjects.length : 'not an array'}</div>
                <div>projects after filter: {projects.length}</div>
                {allProjects[0] && <div>First project status: {allProjects[0].status}</div>}
              </div>

              <p className="text-xs">
                Open DevTools → Console. You should see a blue log line starting with <strong>[Public Projects]</strong>.
                <br />Also check the Network tab for the request to <code>/api/projects</code>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project: any) => {
                // Find main image (or fallback to first image)
                const mainImage = project.images?.find((img: any) => img.is_main) || project.images?.[0];
                const imageUrl = mainImage 
                  ? getCloudinaryImageUrl(mainImage.url, { width: 600, height: 380, crop: 'fill' }) 
                  : '/placeholder-project.jpg';

                return (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.slug}`}
                    className="group block"
                  >
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                      {/* Main Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Optional status badge */}
                        {project.status === 'active' && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Completed
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="p-5 flex-1 flex items-center">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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
            {['Healthcare', 'Commercial Real Estate', 'Manufacturing', 'Education', 'Hospitality'].map((industry) => (
              <div key={industry} className="bg-card border border-border rounded-lg p-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">{industry}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {industry === 'Healthcare' && 'Advanced air quality systems for patient safety and regulatory compliance'}
                  {industry === 'Commercial Real Estate' && 'Efficient climate control for office complexes and retail spaces'}
                  {industry === 'Manufacturing' && 'Industrial-grade solutions for production environments and safety'}
                  {industry === 'Education' && 'Campus-wide systems supporting learning and research environments'}
                  {industry === 'Hospitality' && 'Reliable HVAC solutions for hotels, restaurants and public spaces'}
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
