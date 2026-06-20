import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import ProductImageGallery from './product-image-gallery';

// Revalidate every 60 seconds — ISR keeps pages fresh without force-dynamic
export const revalidate = 60;

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface ProductImage {
  id: number;
  url: string;
  is_main: boolean;
  position: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  code?: string;
  sku?: string;
  model?: string;
  price: string | number;
  sale_price?: string | number;
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
  images?: ProductImage[];
  stocks?: { quantity: number; reserved_quantity: number; low_stock_threshold?: number }[];
  created_at: string;
  updated_at: string;
}

async function getProduct(slug: string): Promise<Product | null> {
  // Use server-only API_URL so production SSR hits the real backend address,
  // not localhost (which would resolve to the Next.js container itself)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  try {
    const res = await fetch(`${apiUrl}/products/slug/${slug}`, {
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
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const title       = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || product.description || '';
  const mainImage   = product.images?.find((i) => i.is_main) ?? product.images?.[0];
  const ogImage     = mainImage
    ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/${mainImage.url}`
    : undefined;

  return {
    title,
    description,
    keywords: product.meta_keywords || undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // Prices — API returns strings (PostgreSQL decimal)
  const effectivePrice = product.sale_price ? parseFloat(product.sale_price as string) : parseFloat(product.price as string);
  const basePrice      = parseFloat(product.price as string);
  const isOnSale       = !!product.sale_price && effectivePrice < basePrice;
  const discountPct    = isOnSale ? Math.round((1 - effectivePrice / basePrice) * 100) : 0;

  // Stock
  const stockRecord    = product.stocks?.[0];
  const availableStock = stockRecord ? stockRecord.quantity - stockRecord.reserved_quantity : null;
  const isLowStock     = availableStock !== null && availableStock > 0 && stockRecord?.low_stock_threshold
    ? availableStock <= stockRecord.low_stock_threshold
    : false;

  // Primary category for breadcrumb
  const primaryCategory = product.categories?.find((c) => c.is_primary) ?? product.categories?.[0];

  // JSON-LD structured data (Schema.org Product)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description,
    sku: product.sku,
    mpn: product.code,
    image: product.images?.map((img) =>
      `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_800/${img.url}`
    ) ?? [],
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/products/${product.slug}`,
      price: effectivePrice,
      priceCurrency: 'USD',
      availability: (availableStock === null || availableStock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    ...(product.categories?.length && {
      category: (product.categories.find((c) => c.is_primary) ?? product.categories[0])?.name,
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen">
        {/* Breadcrumb — visible to crawlers */}
        <div className="border-b border-border">
          <nav
            aria-label="breadcrumb"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap"
          >
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            {primaryCategory && (
              <>
                <span>/</span>
                <span className="hover:text-foreground transition-colors">{primaryCategory.name}</span>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[220px]">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ── Image Gallery ── */}
            <ProductImageGallery
              images={(product.images ?? []).sort((a, b) => a.position - b.position)}
              name={product.name}
            />

            {/* ── Product Info ── */}
            <div className="flex flex-col gap-5">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="text-xs px-3 py-1 bg-accent text-accent-foreground rounded-full font-medium">Featured</span>
                )}
                {isOnSale && (
                  <span className="text-xs px-3 py-1 bg-red-500 text-white rounded-full font-medium">{discountPct}% OFF</span>
                )}
                {product.categories?.map((cat) => (
                  <span key={cat.id} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full">
                    {cat.name}
                  </span>
                ))}
              </div>

              {/* Name + model */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                {product.model && (
                  <p className="text-muted-foreground mt-1 text-sm">Model: {product.model}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">
                    ${effectivePrice.toLocaleString()}
                  </span>
                  {isOnSale && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${basePrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Starting price · Contact us for a custom quote</p>
              </div>

              {/* Short description */}
              {product.short_description && (
                <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
              )}

              {/* Meta table */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border border-border rounded-xl p-4 bg-muted/30">
                {product.code && (
                  <>
                    <span className="text-muted-foreground">Product Code</span>
                    <span className="font-medium">{product.code}</span>
                  </>
                )}
                {product.sku && (
                  <>
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium">{product.sku}</span>
                  </>
                )}
                {product.subcategories?.length ? (
                  <>
                    <span className="text-muted-foreground">Subcategory</span>
                    <span className="font-medium">{product.subcategories.map((s) => s.name).join(', ')}</span>
                  </>
                ) : null}
                {availableStock !== null && (
                  <>
                    <span className="text-muted-foreground">Availability</span>
                    <span className={`font-medium ${availableStock > 0 ? isLowStock ? 'text-yellow-600' : 'text-green-600' : 'text-red-500'}`}>
                      {availableStock > 0
                        ? isLowStock ? `Low Stock (${availableStock} left)` : `In Stock (${availableStock})`
                        : 'Out of Stock'}
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag.id} className="text-xs px-2.5 py-1 border border-border rounded-full text-muted-foreground">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/inquiries?product=${encodeURIComponent(product.name)}&ref=/products/${product.slug}`}
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
          {product.description && (
            <div className="mt-16 border-t border-border pt-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line max-w-4xl">
                {product.description}
              </p>
            </div>
          )}

          {/* Back link */}
          <div className="mt-12">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
