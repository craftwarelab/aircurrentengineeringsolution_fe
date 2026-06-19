'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  slug: string;
}

// Each item manages its own open state; only one can be open at a time via
// the shared openId / setOpenId props passed from the parent.
function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    // Use the slug as the id so anchor links work: /faqs#what-is-hvac
    <div
      id={faq.slug}
      className={`border rounded-xl overflow-hidden transition-colors ${
        isOpen ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
      }`}
      // itemScope / itemType for Schema.org Question — supports crawlers that
      // read microdata in addition to JSON-LD
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <span
          className="text-base font-semibold text-foreground leading-snug"
          itemProp="name"
        >
          {faq.question}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-5 h-5 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Answer — always rendered in DOM for SEO; visually hidden when closed */}
      <div
        className={`transition-all duration-200 overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        itemScope
        itemType="https://schema.org/Answer"
        itemProp="acceptedAnswer"
        aria-hidden={!isOpen}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="w-full h-px bg-border mb-4" />
          <p
            className="text-muted-foreground text-sm leading-relaxed"
            itemProp="text"
          >
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main accordion ────────────────────────────────────────────────────────────

export default function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div
      className="flex flex-col gap-3"
      // itemScope for the FAQPage type helps some crawlers
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {faqs.map((faq) => (
        <FaqItem
          key={faq.id}
          faq={faq}
          isOpen={openId === faq.id}
          onToggle={() => toggle(faq.id)}
        />
      ))}
    </div>
  );
}
