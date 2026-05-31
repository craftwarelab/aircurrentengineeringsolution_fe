'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories, useCategoryTree, type ProductCategory, type ProductSubcategory } from '@/lib/hooks/use-categories';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface Product {
  id: number;
  name: string;
  slug?: string;
  short_description?: string;
  description?: string;
  price?: number | string;
  sale_price?: number | string;
  type?: string;
  images?: Array<{ url: string; is_main?: boolean }>;
  categories?: any[];
  subcategories?: any[];
}

export default function ProductsPage() {
  // Load active products from real API
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useProducts(1, 100, 'active');
  const apiProducts = (productsResponse as any)?.data?.data || (productsResponse as any)?.data || [];

  // Real categories from API
  const { data: categoriesData } = useCategories();
  const { data: categoryTree } = useCategoryTree();

  const categories: ProductCategory[] = Array.isArray(categoriesData) 
    ? categoriesData 
    : (categoriesData as any)?.data || [];

  const subcategories: ProductSubcategory[] = (categoryTree || []).flatMap(
    (cat: ProductCategory) => cat.subcategories || []
  );

  // Use real products from API
  const allProducts = apiProducts;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'price-low' | 'price-high'>('name-asc');
  const [visibleCount, setVisibleCount] = useState(60);
  const observerRef = useRef<HTMLDivElement>(null);

  // Product Dialog State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [dialogImageLoading, setDialogImageLoading] = useState(true);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.short_description && p.short_description.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p: any) => {
        const productCatNames = (p.categories || []).map((c: any) => c.name.toLowerCase());
        return selectedCategories.some(cat => productCatNames.includes(cat.toLowerCase()));
      });
    }

    if (selectedSubcategories.length > 0) {
      result = result.filter((p: any) => {
        const productSubNames = (p.subcategories || []).map((s: any) => s.name.toLowerCase());
        return selectedSubcategories.some(sub => productSubNames.includes(sub.toLowerCase()));
      });
    }

    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    result = result.filter((p) => {
      const price = p.sale_price || p.price || 0;
      return price >= min && price <= max;
    });

    result.sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'price-low') {
        const priceA = a.sale_price || a.price || 0;
        const priceB = b.sale_price || b.price || 0;
        return priceA - priceB;
      }
      if (sortOption === 'price-high') {
        const priceA = a.sale_price || a.price || 0;
        const priceB = b.sale_price || b.price || 0;
        return priceB - priceA;
      }
      return 0;
    });

    return result;
  }, [allProducts, searchQuery, selectedCategories, selectedSubcategories, minPrice, maxPrice, sortOption]);

  const displayedProducts = filteredProducts.slice(0, Math.min(visibleCount, filteredProducts.length));



  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(60);
  }, [searchQuery, selectedCategories, selectedSubcategories, minPrice, maxPrice, sortOption]);



  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
          setVisibleCount((prev) => Math.min(prev + 18, filteredProducts.length));
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredProducts.length]);

  return (
    <>
      <section className="bg-background py-8">
        {/* Search Bar - Top of Page */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border border-border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24 min-h-[calc(100vh-140px)] space-y-8">
              <div>
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-1 text-sm">
                  {categories.length > 0 ? (
                    categories.map((category: ProductCategory) => {
                      const isSelected = selectedCategories.includes(category.name);
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategories(prev =>
                              isSelected
                                ? prev.filter(c => c !== category.name)
                                : [...prev, category.name]
                            );
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          <span>{category.name}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  )}

                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      Clear all categories
                    </button>
                  )}
                </div>
              </div>

              {selectedCategories.length > 0 && subcategories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Subcategories</h4>
                  <div className="space-y-1 text-sm">
                    {subcategories.map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub.name);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubcategories(prev =>
                              isSelected
                                ? prev.filter(s => s !== sub.name)
                                : [...prev, sub.name]
                            );
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          <span>{sub.name}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })}
                    {selectedSubcategories.length > 0 && (
                      <button
                        onClick={() => setSelectedSubcategories([])}
                        className="text-xs text-muted-foreground hover:text-foreground mt-1"
                      >
                        Clear all subcategories
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 border border-border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                    Clear Price
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ArrowUpDown size={16} /> Sort By
                </h4>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                >
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{displayedProducts.length}</span> of {filteredProducts.length} products
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
              </div>
            ) : productsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : productsError ? (
              <div className="text-center py-20 text-red-500">
                Failed to load products. Please try again later.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {displayedProducts.map((product) => {
                  const displayPrice = product.sale_price || product.price;
                  return (
                     <div
                       key={product.id}
                       className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:scale-[1.03]"
                     >
                        <div
                          className="h-56 bg-muted relative overflow-hidden cursor-pointer"
                          onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); setDialogImageLoading(true); }}
                        >
                          {product.images && product.images.length > 0 ? (
                            <div className="relative w-full h-full">
                              {/* Industry Standard Skeleton Loader */}
                              <div className="shimmer-loader absolute inset-0 bg-gray-100 rounded-xl overflow-hidden z-10">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_2s_infinite]" />
                              </div>
                              <img
                                src={getCloudinaryImageUrl(
                                  product.images.find((img: any) => img.is_main)?.url || product.images[0].url,
                                  { width: 400, height: 300, crop: 'fill' }
                                )}
                                alt={product.name}
                                className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onLoad={(e) => {
                                  const parent = e.currentTarget.parentElement as HTMLElement;
                                  if (parent) {
                                    const loader = parent.querySelector('.shimmer-loader') as HTMLElement;
                                    if (loader) loader.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                              <div className="text-center">
                                <div className="text-4xl mb-2">❄️</div>
                                <span className="text-xs text-muted-foreground font-medium">HVAC EQUIPMENT</span>
                              </div>
                            </div>
                          )}
                         {product.sale_price && (
                           <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">SALE</div>
                         )}
                       </div>

                      <div
                        className="p-6 flex flex-col flex-1 cursor-pointer"
                        onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); setDialogImageLoading(true); }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-xl text-foreground group-hover:text-accent transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        {product.type && (
                          <span className="inline-block text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full w-fit mb-3">
                            {product.type}
                          </span>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                          {product.short_description || product.description}
                        </p>

                        {displayPrice && (
                          <div className="mt-4 mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-foreground">${displayPrice.toLocaleString()}</span>
                              {product.sale_price && product.price && (
                                <span className="text-sm text-muted-foreground line-through">${product.price.toLocaleString()}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Starting price • Contact for quote</p>
                          </div>
                        )}
                      </div>

                      <div className="px-6 pb-6">
                        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                          <Link href={product.slug ? `/products/${product.slug}` : `/contact?product=${encodeURIComponent(product.name)}`}>View Product</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            {visibleCount < filteredProducts.length && (
              <div ref={observerRef} className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  Loading more products...
                </div>
              </div>
            )}
           </div>
        </div>
      </section>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-[1400px] h-[80vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row scale-[1.05]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

              {/* Left: Image Gallery */}
            <div className="lg:w-2/3 bg-gray-50 p-10 flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-white rounded-xl border mb-4 overflow-hidden relative">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                   <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {dialogImageLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-accent animate-spin" />
                        </div>
                      )}
                      <Zoom key={selectedImageIndex}>
                        <img
                          src={getCloudinaryImageUrl(
                            selectedProduct.images[selectedImageIndex]?.url || selectedProduct.images[0].url,
                            { width: 800, height: 600, crop: 'fill' }
                          )}
                          alt={selectedProduct.name}
                          className="relative max-h-full max-w-full object-contain transition-transform duration-200"
                          onLoad={() => setDialogImageLoading(false)}
                        />
                      </Zoom>
                   </div>
                ) : (
                  <div className="text-center">
                    <div className="text-8xl mb-4">❄️</div>
                    <div className="text-lg font-medium text-gray-500">No image available</div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedProduct.images.map((img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedImageIndex(index); setDialogImageLoading(true); }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index ? 'border-accent' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getCloudinaryImageUrl(img.url, { width: 120, height: 120, crop: 'fill' })}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="lg:w-1/3 p-6 flex flex-col overflow-y-auto">
              <div className="mb-6">
                {selectedProduct.type && (
                  <span className="inline-block text-sm px-3 py-1 bg-accent/10 text-accent rounded-full mb-3">
                    {selectedProduct.type}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedProduct.name}
                </h1>
                
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${(selectedProduct.sale_price || selectedProduct.price || 0).toLocaleString()}
                  </span>
                  {selectedProduct.sale_price && selectedProduct.price && (
                    <span className="text-xl text-gray-400 line-through">
                      ${selectedProduct.price.toLocaleString()}
                    </span>
                  )}
                </div>
                 <p className="text-sm text-gray-500">Starting price • Contact for quote</p>
               </div>
 
               {/* Description */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedProduct.short_description || selectedProduct.description}
                </p>
              </div>

              {/* Specifications */}
               {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                 <div className="mb-8">
                   <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                   <div className="grid grid-cols-1 gap-3">
                     {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                       <div key={key} className="flex justify-between border-b pb-2">
                         <span className="text-gray-500">{key}</span>
                         <span className="font-medium">{value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              <div className="flex-1"></div>

               {/* Actions */}
                 <div className="pt-4 border-t mt-auto">
                  <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={selectedProduct.slug ? `/products/${selectedProduct.slug}` : `/contact?product=${encodeURIComponent(selectedProduct.name)}`}>
                      View Product
                    </Link>
                  </Button>
                </div>
             </div>
           </div>

         </div>
       )}
     </>
   );
 }
