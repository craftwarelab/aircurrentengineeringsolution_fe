'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ServiceImageGallery from './service-image-gallery';

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
  categories?: { id: number; name: string; slug: string; is_primary?: boolean }[];
  subcategories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  images?: ServiceImage[];
}

export default function ServicePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    fetch(`${apiUrl}/services/slug/${slug}`, { headers: { 'Accept': 'application/json' } })
      .then((res) => {
        if (!res.ok) { setNotFoundState(true); setLoading(false); return null; }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.success && json.data) {
          setService(json.data);
        } else {
          setNotFoundState(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFoundState(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState || !service) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">This service doesn't exist or is no longer available.</p>
          <Link href="/services" className="inline-flex items-center px-5 py-2.5 bg-accent text-accent-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const hasPrice = service.price && Number(service.price) > 0;
  const effectivePrice = service.sale_price && Number(service.sale_price) > 0
    ? Number(service.sale_price)
    : hasPrice ? Number(service.price) : null;
  const basePrice = hasPrice ? Number(service.price) : null;
  const isOnSale = !!(effectivePrice && basePrice && effectivePrice < basePrice);
  const discountPct = isOnSale ? Math.round((1 - effectivePrice! / basePrice!) * 100) : 0;

  const primaryCategory = service.categories?.find((c) => c.is_primary) ?? service.categories?.[0];
  const sortedImages = (service.images ?? []).sort((a, b) => a.position - b.position);

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <nav aria-label="breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
          {primaryCategory && (
            <>
              <span>/</span>
              <span>{primaryCategory.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[220px]">{service.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image Gallery */}
          <ServiceImageGallery images={sortedImages} name={service.name} />

          {/* Service Info */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {service.is_featured && (
                <span className="text-xs px-3 py-1 bg-accent text-accent-foreground rounded-full font-medium">Featured</span>
              )}
              {isOnSale && (
                <span className="text-xs px-3 py-1 bg-red-500 text-white rounded-full font-medium">{discountPct}% OFF</span>
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
            {effectivePrice && (
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">LKR {effectivePrice.toLocaleString()}</span>
                  {isOnSale && basePrice && (
                    <span className="text-xl text-muted-foreground line-through">LKR {basePrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Starting price · Contact us for a custom quote</p>
              </div>
            )}

            {/* Short description */}
            {service.short_description && (
              <p className="text-muted-foreground leading-relaxed">{service.short_description}</p>
            )}

            {/* Meta table */}
            {(service.code || (service.subcategories && service.subcategories.length > 0)) && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border border-border rounded-xl p-4 bg-muted/30">
                {service.code && (
                  <><span className="text-muted-foreground">Service Code</span><span className="font-medium">{service.code}</span></>
                )}
                {service.subcategories?.length ? (
                  <><span className="text-muted-foreground">Subcategory</span><span className="font-medium">{service.subcategories.map((s) => s.name).join(', ')}</span></>
                ) : null}
              </div>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag.id} className="text-xs px-2.5 py-1 border border-border rounded-full text-muted-foreground">#{tag.name}</span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/inquiries?service=${encodeURIComponent(service.name)}&ref=/services/${service.slug}`}
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

        {/* Full description */}
        {service.description && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">Service Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line max-w-4xl">{service.description}</p>
          </div>
        )}

        <div className="mt-12">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Services
          </Link>
        </div>
      </div>
    </div>
  );
}
