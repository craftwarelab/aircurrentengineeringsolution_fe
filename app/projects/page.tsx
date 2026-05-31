'use client';

import HeroSection from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProjects } from '@/lib/hooks/use-projects';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

export default function ProjectsPage() {
  const { data: projectsResponse, isLoading, error } = useProjects(1, 100, 'active');

  const raw = projectsResponse as any;
  const allProjects: any[] = Array.isArray(raw?.data?.data)
    ? raw.data.data
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];
  return (
    <>
      <HeroSection
        title="Our Projects"
        subtitle="Success Stories"
        description="See how we have delivered exceptional HVAC and ventilation solutions for leading organizations across various industries."
      />

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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Failed to load projects. Please try again later.
            </div>
          ) : allProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No projects available at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProjects.map((project: any) => {
                const mainImage =
                  project.images?.find((img: any) => img.is_main) || project.images?.[0];
                const imageUrl = mainImage
                  ? getCloudinaryImageUrl(mainImage.url, { width: 800, height: 500, crop: 'fill' })
                  : null;

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group block"
                  >
                    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                            <span className="text-4xl">🏗️</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.tags.slice(0, 3).map((tag: any) => (
                              <span
                                key={tag.id}
                                className="text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
                          {project.title}
                        </h3>

                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                            {project.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all gap-1">
                          View Project <span>→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Your Next Success Story Starts Here
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact our team to discuss your project needs and learn how we can help you achieve
            your facility goals with proven HVAC and ventilation solutions.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/contact">Request a Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
