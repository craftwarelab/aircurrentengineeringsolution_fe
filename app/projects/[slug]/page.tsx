import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import ProjectImageGallery from './project-image-gallery';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ProjectImage {
  id: number;
  url: string;
  is_main: boolean;
  position: number;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  status: string;
  created_at: string;
  updated_at: string;
  images?: ProjectImage[];
  tags?: { id: number; name: string; slug: string }[];
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_URL}/projects/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  const title = project.seo_title || project.title;
  const description = project.seo_description || project.description || '';
  const keywords = project.meta_keywords || '';
  const mainImage = project.images?.find((img) => img.is_main) || project.images?.[0];
  const imageUrl = mainImage
    ? getCloudinaryImageUrl(mainImage.url, { width: 1200, height: 630, crop: 'fill' })
    : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: project.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    description: project.description,
    image: project.images?.map((img) =>
      getCloudinaryImageUrl(img.url, { width: 1200, height: 630, crop: 'fill' })
    ),
    datePublished: project.created_at,
    dateModified: project.updated_at,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[240px]">
              {project.title}
            </span>
          </nav>
        </div>

        {/* Hero image */}
        {project.images && project.images.length > 0 && (
          <div className="w-full aspect-[21/7] overflow-hidden bg-muted">
            <img
              src={getCloudinaryImageUrl(
                project.images.find((img) => img.is_main)?.url || project.images[0].url,
                { width: 1600, height: 533, crop: 'fill' }
              )}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & tags */}
              <div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {project.title}
                </h1>
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Project Overview</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Image gallery */}
              {project.images && project.images.length > 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Project Gallery</h2>
                  <ProjectImageGallery images={project.images} title={project.title} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA card */}
              <div className="border border-border rounded-2xl p-6 bg-accent/5 space-y-4">
                <h3 className="font-semibold text-foreground">Start a Similar Project</h3>
                <p className="text-sm text-muted-foreground">
                  Interested in a similar solution for your facility? Our team is ready to help.
                </p>
                <Link
                  href={`/contact?project=${encodeURIComponent(project.title)}`}
                  className="block w-full text-center px-5 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors"
                >
                  Request a Consultation
                </Link>
                <Link
                  href="/projects"
                  className="block w-full text-center px-5 py-3 border border-border hover:bg-muted text-foreground font-medium rounded-xl transition-colors text-sm"
                >
                  View All Projects
                </Link>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-border">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
