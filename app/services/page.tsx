'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServices } from '@/lib/hooks/use-services';
import { 
  useServiceCategories, 
  useServiceCategoryTree, 
  type ServiceCategory as ApiServiceCategory 
} from '@/lib/hooks/use-service-categories';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface Service {
  id: number;
  name: string;
  slug?: string;
  short_description?: string;
  description?: string;
  price?: number | string;
  sale_price?: number | string;
  status?: string;
  is_featured?: boolean;
  images?: Array<{ url: string; is_main?: boolean }>;
  categories?: any[];
  subcategories?: any[];
  tags?: any[];
}

export default function ServicesPage() {
  // Real services from API
  const { data: servicesResponse, isLoading: servicesLoading } = useServices(1, 100, 'active');
  const apiServices = (servicesResponse as any)?.data?.data || (servicesResponse as any)?.data || [];

  // Real categories + tree from API (exactly like products page)
  const { data: categoriesData } = useServiceCategories();
  const { data: categoryTree } = useServiceCategoryTree();

  const categories: ApiServiceCategory[] = Array.isArray(categoriesData) 
    ? categoriesData 
    : (categoriesData as any)?.data || [];

  const subcategories = (categoryTree || []).flatMap(
    (cat: any) => cat.subcategories || []
  );

  // State declarations must come before any useMemo/useEffect that references them
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  // Only show subcategories related to the currently selected categories (multi-category support)
  const relevantSubcategories = useMemo(() => {
    if (selectedCategories.length === 0) return [];

    const selectedSet = new Set(selectedCategories.map(c => c.toLowerCase()));

    return (categoryTree || []).flatMap((cat: any) => {
      if (selectedSet.has((cat.name || '').toLowerCase())) {
        return cat.subcategories || [];
      }
      return [];
    });
  }, [selectedCategories, categoryTree]);

  // Use real services from API
  const allServices = apiServices;

  // Auto-remove selected subcategories that no longer belong to any currently selected category
  useEffect(() => {
    if (selectedSubcategories.length === 0) return;

    const stillValid = selectedSubcategories.filter(subName =>
      relevantSubcategories.some((sub: any) => sub.name === subName)
    );

    if (stillValid.length !== selectedSubcategories.length) {
      setSelectedSubcategories(stillValid);
    }
  }, [selectedCategories, relevantSubcategories]);

  // Service Dialog State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const filteredServices = useMemo(() => {
    let result = [...allServices];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s: any) =>
          s.name.toLowerCase().includes(q) ||
          (s.short_description && s.short_description.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((s: any) => {
        const serviceCatNames = (s.categories || []).map((c: any) => c.name.toLowerCase());
        return selectedCategories.some(cat => serviceCatNames.includes(cat.toLowerCase()));
      });
    }

    if (selectedSubcategories.length > 0) {
      result = result.filter((s: any) => {
        const serviceSubNames = (s.subcategories || []).map((s: any) => s.name.toLowerCase());
        return selectedSubcategories.some(sub => serviceSubNames.includes(sub.toLowerCase()));
      });
    }

    return result;
  }, [allServices, searchQuery, selectedCategories, selectedSubcategories]);

  return (
    <>
      <div className="bg-background py-8">
        {/* Top Search Bar */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border border-border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8">
          {/* Sidebar - exactly like products page */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24 min-h-[calc(100vh-140px)] space-y-8">
              <div>
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-1 text-sm">
                  {categories.length > 0 ? (
                    categories.map((category: ApiServiceCategory) => {
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

              {relevantSubcategories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Subcategories</h4>
                  <div className="space-y-1 text-sm">
                    {relevantSubcategories.map((sub: any) => {
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
            </div>
          </div>

          {/* Services Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredServices.length}</span> services
              </div>
            </div>

            {servicesLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No services found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredServices.map((service) => (
                   <div
                     key={service.id}
                     onClick={() => {
                       setSelectedService(service);
                       setSelectedImageIndex(0);
                     }}
                     className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:scale-[1.03] cursor-pointer"
                   >
                     {/* Service Main Image - matches products page pattern */}
                     <div className="h-48 bg-muted relative overflow-hidden">
                       {service.images && service.images.length > 0 ? (
                         <div className="relative w-full h-full">
                           {/* Industry Standard Skeleton Loader (shimmer) */}
                           <div className="shimmer-loader absolute inset-0 bg-gray-100 rounded-xl overflow-hidden z-10">
                             <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_2s_infinite]" />
                           </div>
                           <img
                             src={getCloudinaryImageUrl(
                               service.images.find((img: any) => img.is_main)?.url || service.images[0].url,
                               { width: 400, height: 300, crop: 'fill' }
                             )}
                             alt={service.name}
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
                             <div className="text-4xl mb-2">⚙️</div>
                             <span className="text-xs text-muted-foreground font-medium tracking-wider">HVAC SERVICE</span>
                           </div>
                         </div>
                       )}
                     </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-3">
                       <span className="inline-block text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full">
                         {(service.categories && service.categories[0]?.name) || 'Service'}
                       </span>
                      </div>

                      <h3 className="font-semibold text-xl text-foreground group-hover:text-accent transition-colors mb-3">
                        {service.name}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {service.description}
                      </p>

                      <Button asChild className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href={`/contact?service=${encodeURIComponent(service.name)}`}>
                          Request Service
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </div>
        </div>
      </div>

      {/* Service Detail Dialog - API integrated, modeled after products page */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedService(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-[1400px] h-[80vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            {/* Left: Image Gallery (2/3 width) - Real API images with Zoom */}
            <div className="lg:w-2/3 bg-gray-50 p-10 flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-white rounded-xl border mb-4 overflow-hidden relative">
                {selectedService.images && selectedService.images.length > 0 ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {/* Shimmer Loader */}
                    <div id={`dialog-loader-${selectedImageIndex}`} className="shimmer-loader absolute inset-0 bg-gray-100 rounded-xl overflow-hidden z-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_2s_infinite]" />
                    </div>

                    <Zoom key={selectedImageIndex}>
                      <img
                        src={getCloudinaryImageUrl(
                          selectedService.images[selectedImageIndex]?.url || selectedService.images[0].url,
                          { width: 800, height: 600, crop: 'fill' }
                        )}
                        alt={selectedService.name}
                        className="relative max-h-full max-w-full object-contain transition-transform duration-200"
                        onLoad={() => {
                          const loader = document.getElementById(`dialog-loader-${selectedImageIndex}`);
                          if (loader) loader.style.display = 'none';
                        }}
                      />
                    </Zoom>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-8xl mb-4">⚙️</div>
                    <div className="text-lg font-medium text-gray-500">No image available</div>
                  </div>
                )}
              </div>

              {/* Thumbnails - Real images from API */}
              {selectedService.images && selectedService.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedService.images.map((img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index ? 'border-accent' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getCloudinaryImageUrl(img.url, { width: 120, height: 120, crop: 'fill' })}
                        alt={`${selectedService.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Service Info (1/3 width) - Real API data */}
            <div className="lg:w-1/3 p-6 flex flex-col overflow-y-auto">
              <div className="mb-6">
                {/* Categories */}
                {selectedService.categories && selectedService.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedService.categories.map((cat: any, idx: number) => (
                      <span key={idx} className="inline-block text-sm px-3 py-1 bg-accent/10 text-accent rounded-full">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Subcategories */}
                {selectedService.subcategories && selectedService.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedService.subcategories.map((sub: any, idx: number) => (
                      <span key={idx} className="inline-block text-xs px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedService.name}
                </h1>

                {/* Price (if available) */}
                {(selectedService.price || selectedService.sale_price) && (
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${(selectedService.sale_price || selectedService.price || 0)}
                    </span>
                    {selectedService.sale_price && selectedService.price && (
                      <span className="text-xl text-gray-400 line-through">
                        ${selectedService.price}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex-1 overflow-y-auto pr-2 mb-6">
                <h3 className="font-semibold text-lg mb-3">Service Description</h3>
                
                {selectedService.short_description && (
                  <p className="text-gray-700 font-medium mb-3">
                    {selectedService.short_description}
                  </p>
                )}
                
                <p className="text-gray-600 leading-relaxed">
                  {selectedService.description || 'No description available.'}
                </p>

                {/* Tags */}
                {selectedService.tags && selectedService.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-sm mb-2 text-gray-500">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.tags.map((tag: any, idx: number) => (
                        <span key={idx} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-auto">
                <Button asChild size="lg" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href={`/contact?service=${encodeURIComponent(selectedService.name)}`}>
                    Request Service
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
