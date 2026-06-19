'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, X, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServices } from '@/lib/hooks/use-services';
import {
  useServiceCategories,
  useServiceCategoryTree,
  type ServiceCategory as ApiServiceCategory,
} from '@/lib/hooks/use-service-categories';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ServiceImage {
  url: string;
  is_main?: boolean;
}

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
  images?: ServiceImage[];
  categories?: any[];
  subcategories?: any[];
  tags?: any[];
}

export default function ServicesPage() {
  const { data: servicesResponse, isLoading: servicesLoading } = useServices(1, 100, 'active');
  const apiServices: Service[] = (servicesResponse as any)?.data?.data || (servicesResponse as any)?.data || [];

  const { data: categoriesData } = useServiceCategories();
  const { data: categoryTree } = useServiceCategoryTree();

  const categories: ApiServiceCategory[] = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);

  // Dialog state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogImageIndex, setDialogImageIndex] = useState(0);

  const relevantSubcategories = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    const selectedSet = new Set(selectedCategories);
    return (categoryTree || []).flatMap((cat: any) =>
      selectedSet.has(cat.id) ? cat.subcategories || [] : []
    );
  }, [selectedCategories, categoryTree]);

  useEffect(() => {
    if (selectedSubcategories.length === 0) return;
    const validIds = new Set(relevantSubcategories.map((sub: any) => sub.id));
    const stillValid = selectedSubcategories.filter((id) => validIds.has(id));
    if (stillValid.length !== selectedSubcategories.length) setSelectedSubcategories(stillValid);
  }, [selectedCategories, relevantSubcategories]);

  const filteredServices = useMemo(() => {
    let result = [...apiServices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.short_description?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((s) => {
        const ids = (s.categories || []).map((c: any) => Number(c.id));
        return selectedCategories.some((id) => ids.includes(id));
      });
    }
    if (selectedSubcategories.length > 0) {
      result = result.filter((s) => {
        const ids = (s.subcategories || []).map((sub: any) => Number(sub.id));
        return selectedSubcategories.some((id) => ids.includes(id));
      });
    }
    return result;
  }, [apiServices, searchQuery, selectedCategories, selectedSubcategories]);

  const openDialog = (service: Service) => {
    const mainIdx = (service.images || []).findIndex((img) => img.is_main);
    setDialogImageIndex(mainIdx >= 0 ? mainIdx : 0);
    setSelectedService(service);
  };

  return (
    <>
      <div className="bg-background py-8">
        {/* Search */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search services..."
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
            <div className="bg-card border border-border rounded-xl sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">

                {/* Categories */}
                <div>
                  <h4 className="font-semibold mb-3">Categories</h4>
                  <div className={`space-y-1 text-sm ${categories.length > 8 ? 'max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent' : ''}`}>
                    {categories.length > 0 ? (
                      categories.map((category) => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                          <button
                            key={category.id}
                            onClick={() =>
                              setSelectedCategories((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== category.id)
                                  : [...prev, category.id]
                              )
                            }
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
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories */}
                {relevantSubcategories.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Subcategories</h4>
                    <div className={`space-y-1 text-sm ${relevantSubcategories.length > 8 ? 'max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent' : ''}`}>
                      {relevantSubcategories.map((sub: any) => {
                        const isSelected = selectedSubcategories.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() =>
                              setSelectedSubcategories((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== sub.id)
                                  : [...prev, sub.id]
                              )
                            }
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
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredServices.length}</span> services
              </p>
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
                {filteredServices.map((service) => {
                  const mainImg =
                    service.images?.find((img) => img.is_main)?.url || service.images?.[0]?.url;
                  return (
                    <div
                      key={service.id}
                      onClick={() => openDialog(service)}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:scale-[1.02] cursor-pointer"
                    >
                      {/* Image */}
                      <div className="h-48 bg-muted relative overflow-hidden">
                        {mainImg ? (
                          <img
                            src={getCloudinaryImageUrl(mainImg, { width: 400, height: 300, crop: 'fill' })}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                            <div className="text-center">
                              <div className="text-4xl mb-2">⚙️</div>
                              <span className="text-xs text-muted-foreground font-medium tracking-wider">SERVICE</span>
                            </div>
                          </div>
                        )}
                        {service.is_featured && (
                          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        {service.categories && service.categories[0] && (
                          <span className="inline-block text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full mb-2 w-fit">
                            {service.categories[0].name}
                          </span>
                        )}
                        <h3 className="font-semibold text-base text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2">
                          {service.name}
                        </h3>
                        {service.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                            {service.short_description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-1 text-accent text-sm font-medium">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Detail Dialog */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>

            {/* Left: Images */}
            <div className="lg:w-1/2 bg-muted/30 p-6 flex flex-col gap-4">
              {/* Main image */}
              <div className="flex-1 flex items-center justify-center bg-card rounded-xl border border-border overflow-hidden min-h-[240px]">
                {selectedService.images && selectedService.images.length > 0 ? (
                  <Zoom key={dialogImageIndex}>
                    <img
                      src={getCloudinaryImageUrl(
                        selectedService.images[dialogImageIndex]?.url || selectedService.images[0].url,
                        { width: 700, height: 500, crop: 'fill' }
                      )}
                      alt={selectedService.name}
                      className="max-h-64 w-full object-cover"
                    />
                  </Zoom>
                ) : (
                  <div className="text-center p-8">
                    <div className="text-6xl mb-3">⚙️</div>
                    <p className="text-sm text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {selectedService.images && selectedService.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedService.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setDialogImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                        dialogImageIndex === index ? 'border-accent' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <img
                        src={getCloudinaryImageUrl(img.url, { width: 100, height: 100, crop: 'fill' })}
                        alt={`${selectedService.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="lg:w-1/2 p-6 flex flex-col overflow-y-auto">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedService.is_featured && (
                  <span className="text-xs px-2.5 py-1 bg-accent text-accent-foreground rounded-full font-medium">Featured</span>
                )}
                {selectedService.categories?.map((cat: any) => (
                  <span key={cat.id} className="text-xs px-2.5 py-1 bg-accent/10 text-accent rounded-full">{cat.name}</span>
                ))}
                {selectedService.subcategories?.map((sub: any) => (
                  <span key={sub.id} className="text-xs px-2.5 py-1 bg-muted text-muted-foreground rounded-full">{sub.name}</span>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3">{selectedService.name}</h2>

              {/* Price */}
              {(selectedService.price && Number(selectedService.price) > 0) && (
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-foreground">
                    LKR {(selectedService.sale_price && Number(selectedService.sale_price) > 0
                      ? Number(selectedService.sale_price)
                      : Number(selectedService.price)
                    ).toLocaleString()}
                  </span>
                  {selectedService.sale_price && Number(selectedService.sale_price) > 0 &&
                    Number(selectedService.sale_price) < Number(selectedService.price) && (
                    <span className="text-base text-muted-foreground line-through">
                      LKR {Number(selectedService.price).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Short description — the key content for the dialog */}
              {selectedService.short_description && (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {selectedService.short_description}
                </p>
              )}

              {/* Code */}
              {(selectedService as any).code && (
                <p className="text-sm text-muted-foreground mb-4">
                  Code: <span className="font-medium text-foreground">{(selectedService as any).code}</span>
                </p>
              )}

              {/* Tags */}
              {selectedService.tags && selectedService.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedService.tags.map((tag: any) => (
                    <span key={tag.id} className="text-xs px-2 py-0.5 border border-border rounded-full text-muted-foreground">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-border">
                {/* View full page */}
                {selectedService.slug && (
                  <Link
                    href={`/services/${selectedService.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
                    onClick={() => setSelectedService(null)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Details
                  </Link>
                )}
                <Link
                  href={`/inquiries?service=${encodeURIComponent(selectedService.name)}`}
                  className="inline-flex items-center justify-center px-5 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors"
                  onClick={() => setSelectedService(null)}
                >
                  Submit an Inquiry
                </Link>
                <button
                  onClick={() => setSelectedService(null)}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
