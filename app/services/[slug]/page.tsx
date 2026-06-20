import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import ServiceImageGallery from './service-image-gallery';

// Revalidate every 60 seconds — ISR keeps pages fresh without force-dynamic
export const revalidate = 60;


interface ServiceImage {
  id: number;
  url: string;
  is_main: boolean;
  position: number;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  code?: string;
  price?: string | number | null;
  sale_price?: string | number | null;
  description?: string;
  short_description?: string;
  status: string;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  categories?: { id: number; name: string; slug: string }[];
  subcategories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  images?: ServiceImage[];
  created_at: string;
  updated_at: string;
}

async function getService(slug: string): Promise<Service | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  try {
    const res = await fetch(`${apiUrl}/services/slug/${slug}`, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? json.data : null;
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
  const service = await getService(slug);

  if (!service) {
    return { title: 'Service Not Found', description: 'The requested service could not be found.' };
  }

  const title = service.seo_title || service.name;
  const stripHtml = (html: string) => (html || '').replace(/<[^>]+>/g, '');
  const description = service.seo_description || stripHtml(service.short_description || service.description || '');
  const keywords = service.meta_keywords || '';
  const mainImage = service.images?.find((img) => img.is_main) || service.images?.[0];
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
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: service.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) notFound();

  const hasPrice = service.price && Number(service.price) > 0;
  const displayPrice = service.sale_price && Number(service.sale_price) > 0
    ? Number(service.sale_price)
    : hasPrice ? Number(service.price) : null;
  const originalPrice =
    service.sale_price && service.price && Number(service.sale_price) < Number(service.price)
      ? Number(service.price)
      : null;
  const hasDiscount = !!originalPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(service.sale_price) / Number(service.price!)) * 100)
    : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description || service.short_description,
    ...(displayPrice && { offers: { '@type': 'Offer', price: displayPrice, priceCurrency: 'LKR' } }),
    ...(service.categories?.length && { category: service.categories.map((c) => c.name).join(', ') }),
    image: service.images?.map((img) => getCloudinaryImageUrl(img.url, { width: 800, height: 600, crop: 'fill' })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{service.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Image Gallery */}
            <ServiceImageGallery images={service.images || []} name={service.name} />

            {/* Service Info */}
            <div className="flex flex-col gap-6">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {service.is_featured && (
                  <span className="text-xs px-3 py-1 bg-accent text-accent-foreground rounded-full font-medium">Featured</span>
                )}
                {hasDiscount && (
                  <span className="text-xs px-3 py-1 bg-red-500 text-white rounded-full font-medium">{discountPercent}% OFF</span>
                )}
                {service.categories?.map((cat) => (
                  <span key={cat.id} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full">{cat.name}</span>
                ))}
              </div>

              {/* Name */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">{service.name}</h1>
                {service.code && <p className="text-muted-foreground mt-1 text-sm">Code: {service.code}</p>}
              </div>

              {/* Price */}
              {displayPrice ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-foreground">
                      LKR {displayPrice.toLocaleString()}
                    </span>
                    {originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        LKR {originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground -mt-4">Starting price · Contact us for a custom quote</p>
                </>
              ) : null}

              {/* Short Description */}
              {service.short_description && (
                <p className="text-muted-foreground leading-relaxed">
                  {service.short_description}
                </p>
              )}

              {/* Meta grid */}
              {(service.code || (service.subcategories && service.subcategories.length > 0)) && (
                <div className="grid grid-cols-2 gap-3 text-sm border border-border rounded-xl p-4 bg-muted/30">
                  {service.code && (
                    <>
                      <span className="text-muted-foreground">Service Code</span>
                      <span className="font-medium">{service.code}</span>
                    </>
                  )}
                  {service.subcategories?.length ? (
                    <>
                      <span className="text-muted-foreground">Subcategory</span>
                      <span className="font-medium">{service.subcategories.map((s) => s.name).join(', ')}</span>
                    </>
                  ) : null}
                </div>
              )}

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag.id} className="text-xs px-2.5 py-1 border border-border rounded-full text-muted-foreground">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/inquiries?service=${encodeURIComponent(service.name)}`}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors"
                >
                  Submit an Inquiry
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted text-foreground font-semibold rounded-xl transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Full Description */}
          {service.description && (
            <div className="mt-16 border-t border-border pt-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">Service Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line max-w-4xl">
                {service.description}
              </p>
            </div>
          )}

          {/* Back */}
          <div className="mt-12">
            <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
