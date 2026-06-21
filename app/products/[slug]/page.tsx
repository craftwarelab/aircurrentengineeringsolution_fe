import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import ProductImageGallery from './product-image-gallery';
import { sanitizeHtml } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_INTERNAL_API || 'http://localhost:8000/api';
const X_INTERNAL_API_HEADER = process.env.NEXT_PUBLIC_INTERNAL_API_KEY || 'internal-api-key-placeholder';

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
  categories?: { id: number; name: string; slug: string }[];
  subcategories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  images?: ProductImage[];
  stocks?: { quantity: number; reserved_quantity: number }[];
  created_at: string;
  updated_at: string;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    console.log("API_URL:", API_URL);
    console.log("HEADER:", X_INTERNAL_API_HEADER);
    console.log(`[getProduct] Fetching product: ${slug}`);
    const res = await fetch(`${API_URL}/products/slug/${slug}`, {
      cache: 'no-store',
      headers: {
        'x-internal-api': X_INTERNAL_API_HEADER,
      }
    });
    console.log(`[getProduct] Response status: ${res.status}`);
    if (!res.ok) return null;
    const data = await res.json();
    console.log(`[getProduct] Found:`, data.success ? data.data?.name : 'not found');
    return data.success ? data.data : null;
  } catch (err) {
    console.error(`[getProduct] Error fetching "${slug}":`, err);
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

  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || product.description || '';
  const keywords = product.meta_keywords || '';
  const mainImage = product.images?.find((img) => img.is_main) || product.images?.[0];
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
        images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <span className="text-4xl">📦</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
        >
          ← Browse All Products
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.find((img) => img.is_main) || product.images?.[0];
  const displayPrice = Number(product.sale_price) || Number(product.price);
  const originalPrice = product.sale_price ? Number(product.price) : null;
  const hasDiscount = !!(product.sale_price && Number(product.sale_price) < Number(product.price));
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100)
    : 0;

  const stockInfo = product.stocks?.[0];
  const availableStock = stockInfo
    ? stockInfo.quantity - stockInfo.reserved_quantity
    : null;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description,
    sku: product.sku,
    model: product.model,
    image: product.images?.map((img) =>
      getCloudinaryImageUrl(img.url, { width: 800, height: 600, crop: 'fill' })
    ),
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: 'USD',
      availability:
        availableStock === null || availableStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    ...(product.categories?.length && {
      category: product.categories.map((c) => c.name).join(', '),
    }),
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
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <ProductImageGallery images={product.images || []} name={product.name} />

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="text-xs px-3 py-1 bg-accent text-accent-foreground rounded-full font-medium">
                    Featured
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs px-3 py-1 bg-red-500 text-white rounded-full font-medium">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>

              {/* Name */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                {product.model && (
                  <p className="text-muted-foreground mt-1">Model: {product.model}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">
                  ${displayPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground -mt-4">
                Starting price · Contact us for a custom quote
              </p>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Product Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm border border-border rounded-xl p-4 bg-muted/30">
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
                    <span className="font-medium">
                      {product.subcategories.map((s) => s.name).join(', ')}
                    </span>
                  </>
                ) : null}
                {availableStock !== null && (
                  <>
                    <span className="text-muted-foreground">Availability</span>
                    <span
                      className={`font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {availableStock > 0 ? `In Stock (${availableStock})` : 'Out of Stock'}
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2.5 py-1 border border-border rounded-full text-muted-foreground"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/contact?product=${encodeURIComponent(product.name)}`}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors"
                >
                  Request a Quote
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

          {/* Description */}
          {product.description && (
            <div className="mt-16 border-t border-border pt-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line max-w-4xl">
                {product.description}
              </p>
            </div>
          )}

          {/* Back to products */}
          <div className="mt-12">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
