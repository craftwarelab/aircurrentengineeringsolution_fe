import HeroSection from '@/components/hero-section';
import FeatureCard from '@/components/feature-card';
import { getProducts } from '@/lib/mockDatabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Products() {
  const products = getProducts();
  
  const types = [...new Set(products.map(p => p.type))];
  const productsByType: Record<string, typeof products> = {};
  
  types.forEach(type => {
    productsByType[type] = products.filter(p => p.type === type);
  });

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Our Products"
        subtitle="Quality Equipment"
        description="We offer a curated selection of industry-leading HVAC and ventilation equipment, all backed by our expertise and service excellence."
      />

      {/* Products Grid */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {types.map((type) => (
              <div key={type}>
                <h2 className="text-2xl font-bold text-foreground mb-8">{type}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {productsByType[type].map((product) => (
                    <FeatureCard
                      key={product.id}
                      title={product.name}
                      description={product.description}
                      category={product.type}
                      specs={product.specifications}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Benefits */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Why Our Products?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Premium Quality</h3>
              <p className="text-muted-foreground">
                We partner with leading manufacturers who share our commitment to quality, reliability, 
                and innovation. Every product is rigorously tested and selected for performance.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Expert Selection</h3>
              <p className="text-muted-foreground">
                Our engineers evaluate products to ensure they meet industry standards and are suited 
                for your specific application and operating conditions.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Comprehensive Support</h3>
              <p className="text-muted-foreground">
                From selection and installation to commissioning and ongoing maintenance, we provide 
                complete support to maximize your equipment&apos;s performance and lifespan.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Energy Efficiency</h3>
              <p className="text-muted-foreground">
                All our products meet or exceed current energy efficiency standards, helping reduce 
                operating costs while minimizing environmental impact.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Warranty Coverage</h3>
              <p className="text-muted-foreground">
                Our products come with comprehensive manufacturer warranties, and we stand behind our 
                installation and service work with additional guarantees.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Availability</h3>
              <p className="text-muted-foreground">
                We maintain strategic inventory of popular products and have established relationships 
                with manufacturers for quick delivery of specialized equipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Product Categories</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            We offer products across the full spectrum of HVAC and ventilation needs, from primary system 
            components to advanced controls and optimization systems.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'HVAC Units',
                desc: 'Rooftop units, split systems, and packaged equipment for diverse applications',
              },
              {
                name: 'Ventilation Equipment',
                desc: 'ERVs, makeup air units, exhaust fans, and specialized ventilation systems',
              },
              {
                name: 'Controls & Automation',
                desc: 'Building management systems, sensors, and smart controls for optimization',
              },
              {
                name: 'Filtration & Air Quality',
                desc: 'Advanced filters, UV sterilization, and air quality monitoring systems',
              },
              {
                name: 'Ductwork & Accessories',
                desc: 'Custom ductwork, dampers, diffusers, and installation components',
              },
              {
                name: 'Maintenance Supplies',
                desc: 'Filter media, refrigerants, and professional maintenance materials',
              },
            ].map((category, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
            Need Equipment for Your Project?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact us for product recommendations, pricing, and availability. Our team will help you 
            select the perfect equipment for your specific needs.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/contact">Request Product Information</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
