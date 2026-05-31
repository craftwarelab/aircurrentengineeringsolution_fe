import Link from 'next/link';

export default function Sitemap() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Website Sitemap
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Last updated: May 31, 2026
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mb-12">
            This sitemap provides a hierarchical view of all publicly accessible pages 
            on the Air Current Eng. Solution website. It helps users and search engines 
            understand the structure and content of our site.
          </p>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Main Navigation */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Main Navigation
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <Link href="/" className="text-accent hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-accent hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-accent hover:underline">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-accent hover:underline">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-accent hover:underline">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/inquiries" className="text-accent hover:underline">
                    Request a Consultation
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-accent hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-accent hover:underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services Subpages */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Services
              </h2>
              <p className="text-muted-foreground mb-4">
                Our comprehensive HVAC and ventilation engineering services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-8">
                <li>HVAC System Design</li>
                <li>Ventilation Engineering</li>
                <li>Installation & Commissioning</li>
                <li>Maintenance & Service Contracts</li>
                <li>Energy Audits & Optimization</li>
                <li>Indoor Air Quality Solutions</li>
                <li>Smart Building Controls</li>
                <li>Retrofits & Upgrades</li>
              </ul>
            </div>

            {/* Products Subpages */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Products
              </h2>
              <p className="text-muted-foreground mb-4">
                We offer a range of high-quality HVAC products from trusted manufacturers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-8">
                <li>Air Handling Units</li>
                <li>Chillers & Cooling Towers</li>
                <li>Fans & Blowers</li>
                <li>Heating Equipment</li>
                <li>Air Distribution Products</li>
                <li>Control Systems & Thermostats</li>
                <li>Filters & Air Purification Equipment</li>
                <li>Pumps & Valves</li>
              </ul>
            </div>

            {/* Projects Categories */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Project Types
              </h2>
              <p className="text-muted-foreground mb-4">
                Our portfolio includes projects across various industries:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-8">
                <li>Commercial Buildings</li>
                <li>Industrial Facilities</li>
                <li>Healthcare Facilities</li>
                <li>Educational Institutions</li>
                <li>Hospitality & Hotels</li>
                <li>Data Centers</li>
                <li>Pharmaceutical Facilities</li>
                <li>Food Processing Plants</li>
              </ul>
            </div>

            {/* Legal & Policy Pages */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Legal & Policy Pages
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy-policy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-accent hover:underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* XML Sitemap Section (for search engines) */}
      <section className="bg-secondary/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            XML Sitemap for Search Engines
          </h2>
          <p className="text-muted-foreground mb-6">
            For search engine crawlers, we provide an XML sitemap at:
          </p>
          <p className="font-mono bg-card p-4 rounded border border-border text-sm">
            https://aircurrentengineeringsolution.com/sitemap.xml
          </p>
          <p className="text-muted-foreground mt-4">
            This XML file contains all URLs on our site with metadata about each URL 
            (when it was last updated, how often it usually changes, and how important 
            it is relative to other URLs in the site) to help search engines crawl 
            our site more intelligently.
          </p>
        </div>
      </section>

      {/* Back to Home Link */}
      <section className="bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="text-accent hover:text-accent/80 transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </section>
    </>
  );
}