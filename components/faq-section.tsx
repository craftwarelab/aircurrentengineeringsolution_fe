'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useVisibleFAQs } from '@/lib/hooks/use-faqs';

// ─── Always-expanded card (first 4) ──────────────────────────────────────────
function FixedFaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h3 className="text-lg font-semibold text-foreground mb-3">{question}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{answer}</p>
    </div>
  );
}

// ─── Collapsible item (5th FAQ onwards) ──────────────────────────────────────
function AccordionFaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-8 py-5 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-foreground">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-8 pb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function FAQSection() {
  const { data: faqs, isLoading, error } = useVisibleFAQs();

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-8 animate-pulse">
                <div className="h-5 bg-muted rounded mb-3 w-3/4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !faqs || faqs.length === 0) return null;

  const pinned = faqs.slice(0, 4);
  const collapsible = faqs.slice(4, 8); // show up to 8 total on home page
  const hasMore = faqs.length > 8;

  return (
    <section className="bg-secondary/30 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          {hasMore && (
            <Link
              href="/faqs"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all {faqs.length} FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* First 4 — always visible, two-column grid */}
        {pinned.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {pinned.map((faq) => (
              <FixedFaqCard key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        )}

        {/* 5th–8th — collapsible, single column */}
        {collapsible.length > 0 && (
          <div className="flex flex-col gap-3">
            {collapsible.map((faq) => (
              <AccordionFaqItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        )}

        {/* Mobile "View all" link */}
        {hasMore && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/faqs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all {faqs.length} FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
