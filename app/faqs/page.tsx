import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Phone, Mail } from 'lucide-react';
import FaqAccordion from '@/components/faq-accordion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQ {
  id: number;
  question: string;
  answer: string;
  priority: number;
  slug: string;
}

// ─── Server-side data fetch ───────────────────────────────────────────────────

async function getVisibleFAQs(): Promise<FAQ[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  try {
    const res = await fetch(`${base}/faqs/visible`, {
      // Revalidate every 10 minutes so crawlers always get fresh data
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Air Current Engineering Solutions',
  description:
    'Find answers to common questions about HVAC systems, ventilation engineering, installation, maintenance, and our services at Air Current Engineering Solutions.',
  keywords: [
    'HVAC FAQ', 'ventilation questions', 'air conditioning FAQ', 'HVAC maintenance',
    'engineering solutions FAQ', 'Air Current Engineering', 'HVAC Sri Lanka',
  ],
  alternates: { canonical: '/faqs' },
  openGraph: {
    title: 'Frequently Asked Questions — Air Current Engineering Solutions',
    description:
      'Answers to your HVAC, ventilation, and engineering service questions. Browse our full FAQ library.',
    url: '/faqs',
    type: 'website',
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FAQsPage() {
  const faqs = await getVisibleFAQs();

  // ── JSON-LD structured data for Google rich results ──────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'FAQs', item: '/faqs' },
    ],
  };

  return (
    <>
      {/* ── Structured data (invisible to users, visible to crawlers) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 rounded-full text-accent text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            Everything you need to know about our HVAC and ventilation engineering services.
            Can't find an answer? Reach out to our team directly.
          </p>
        </div>
      </section>

      {/* ── Breadcrumb (visible + semantic) ──────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-muted/40 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground" aria-current="page">FAQs</li>
          </ol>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="bg-background py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No FAQs available right now.</p>
              <p className="text-sm mt-1">Please check back later or contact us directly.</p>
            </div>
          ) : (
            <>
              {/* ── Count summary ── */}
              <p className="text-sm text-muted-foreground mb-8">
                Showing <strong>{faqs.length}</strong> question{faqs.length !== 1 ? 's' : ''}
              </p>

              {/* ── FAQ accordion — client component for interactivity ── */}
              <FaqAccordion faqs={faqs} />
            </>
          )}
        </div>
      </main>

      {/* ── CTA band ─────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Our engineering team is happy to answer any question — no matter how technical.
            Reach out and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/inquiries"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors"
            >
              Submit an Inquiry <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8 text-sm text-primary-foreground/70">
            <a href="tel:+94701533195" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" /> +94 70 153 3195
            </a>
            <a href="mailto:info@aircurrentengineeringsolution.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> info@aircurrentengineeringsolution.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
