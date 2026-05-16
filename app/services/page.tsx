'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServices, getServiceCategories, getServiceSubcategories } from '@/lib/mockDatabase';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  details?: string[];
}

export default function ServicesPage() {
  const allServices = getServices() as Service[];
  const categories = getServiceCategories();
  const subcategories = getServiceSubcategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  // Service Dialog State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Ensure minimum services for demo
  let services = [...allServices];
  if (services.length < 20) {
    const needed = 20 - services.length;
    for (let i = 0; i < needed; i++) {
      const base = services[i % Math.max(services.length, 1)];
      services.push({
        ...base,
        id: `${base.id}-demo-${i}`,
        name: `${base.name} ${Math.floor(i / services.length) + 1}`,
      });
    }
  }

  const filteredServices = useMemo(() => {
    let result = [...services];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Categories (multi-select)
    if (selectedCategories.length > 0) {
      result = result.filter((s) =>
        selectedCategories.some((cat) =>
          (s.category || '').toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // Subcategories
    if (selectedSubcategories.length > 0) {
      result = result.filter((s) =>
        selectedSubcategories.some((sub) =>
          s.name.toLowerCase().includes(sub.toLowerCase()) ||
          s.description.toLowerCase().includes(sub.toLowerCase())
        )
      );
    }

    return result;
  }, [services, searchQuery, selectedCategories, selectedSubcategories]);

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
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24 space-y-8 min-h-[calc(100vh-140px)]">
              
              {/* Categories */}
              <div>
                <h4 className="font-semibold mb-3">Service Categories</h4>
                <div className="space-y-1 text-sm">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategories(prev =>
                            isSelected ? prev.filter(c => c !== cat.name) : [...prev, cat.name]
                          );
                          setSelectedSubcategories([]);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                  {selectedCategories.length > 0 && (
                    <button onClick={() => setSelectedCategories([])} className="text-xs text-muted-foreground hover:text-foreground mt-1">
                      Clear categories
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
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
                              isSelected ? prev.filter(s => s !== sub.name) : [...prev, sub.name]
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
                      <button onClick={() => setSelectedSubcategories([])} className="text-xs text-muted-foreground hover:text-foreground mt-1">
                        Clear subcategories
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

            {filteredServices.length === 0 ? (
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
                    {/* Service Icon */}
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center transition-transform duration-300 group-hover:scale-110">
                        <div className="text-5xl mb-2">⚙️</div>
                        <span className="text-xs text-muted-foreground font-medium tracking-wider">HVAC SERVICE</span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-3">
                        <span className="inline-block text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full">
                          {service.category}
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

      {/* Service Detail Dialog */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedService(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-[1400px] h-[80vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row scale-[1.05]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            {/* Left: Image Gallery (2/3 width) */}
            <div className="lg:w-2/3 bg-gray-50 p-10 flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-white rounded-xl border mb-4 overflow-hidden">
                <div className="text-center">
                  <div className="text-8xl mb-4">⚙️</div>
                  <div className="text-lg font-medium text-gray-500">Service Image {selectedImageIndex + 1}</div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIndex === index ? 'border-accent' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-3xl">⚙️</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Service Info (1/3 width) */}
            <div className="lg:w-1/3 p-6 flex flex-col overflow-y-auto">
              <div className="mb-6">
                {selectedService.category && (
                  <span className="inline-block text-sm px-3 py-1 bg-accent/10 text-accent rounded-full mb-3">
                    {selectedService.category}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedService.name}
                </h1>
              </div>

              {/* Scrollable Description */}
              <div className="flex-1 overflow-y-auto pr-2 mb-6">
                <h3 className="font-semibold text-lg mb-3">Service Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {selectedService.description}
                </p>
                
                {/* Extra content for scroll demo */}
                <div className="mt-6 space-y-4 text-sm text-gray-600">
                  <p>Our certified technicians bring years of industry experience to every project, ensuring the highest standards of quality and reliability.</p>
                  <p>We use only premium-grade equipment and follow strict safety protocols to deliver results that exceed expectations.</p>
                  <p>Every service includes a comprehensive inspection report and maintenance recommendations for long-term system health.</p>
                </div>
              </div>

              {/* Actions - Fixed at bottom */}
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
