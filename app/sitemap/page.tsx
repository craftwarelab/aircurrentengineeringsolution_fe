import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap | Air Current Engineering Solutions',
  description: 'A complete overview of all pages on the Air Current Engineering Solutions website.',
};

const mainLinks = [
  { href: '/',               label: 'Home' },
  { href: '/about',          label: 'About Us' },
  { href: '/services',       label: 'Services' },
  { href: '/products',       label: 'Products' },
  { href: '/projects',       label: 'Projects' },
  { href: '/customers',      label: 'Customers' },
  { href: '/faqs',           label: 'FAQs' },
  { href: '/inquiries',      label: 'Submit an Inquiry' },
  { href: '/contact',        label: 'Contact Us' },
];

const legalLinks = [
  { href: '/privacy-policy',   label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

function LinkList({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="space-y-2">
      {items.map(({ href, label }) => (
        <li key={href} className="flex items-center gap-2 text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <Link href={href} className="text-accent hover:underline">{label}</Link>
        </li>
      ))}
    </ul>
  );
}

export default function SitemapPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="border-b border-border py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Sitemap</h1>
          <p className="text-muted-foreground">
            A complete overview of all publicly accessible pages on this website.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Main Pages */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Main Pages</h2>
            <LinkList items={mainLinks} />
          </div>

          {/* Dynamic Pages */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Dynamic Pages</h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span><Link href="/products" className="text-accent hover:underline">Products</Link> › individual product pages</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span><Link href="/services" className="text-accent hover:underline">Services</Link> › individual service pages</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Legal</h2>
            <LinkList items={legalLinks} />
          </div>

        </div>
      </section>

      {/* XML Sitemap */}
      <section className="border-t border-border py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-foreground mb-2">XML Sitemap</h2>
          <p className="text-sm text-muted-foreground mb-3">
            For search engine crawlers, the machine-readable sitemap is available at:
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-sm bg-muted px-4 py-2 rounded-lg border border-border text-accent hover:underline"
          >
            /sitemap.xml
          </a>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Return to Homepage
        </Link>
      </div>
    </div>
  );
}
