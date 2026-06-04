'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCustomers, type Customer } from '@/lib/hooks/use-customers';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const logoUrl = (pub: string) => `https://res.cloudinary.com/${CLOUD}/image/upload/${pub}`;

// ─── Customer Detail Dialog ───────────────────────────────────────────────────
function CustomerDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{customer.company_name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 py-4">
          {customer.logo_public_id ? (
            <img
              src={logoUrl(customer.logo_public_id)}
              alt={customer.company_name}
              className="max-h-40 max-w-[280px] object-contain"
            />
          ) : (
            <div className="h-24 w-48 bg-muted rounded-xl flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {customer.company_name[0]}
            </div>
          )}
          {customer.short_description && (
            <p className="text-muted-foreground text-sm text-center leading-relaxed">
              {customer.short_description}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Infinite Ring Carousel ───────────────────────────────────────────────────
function RingCarousel({ customers }: { customers: Customer[] }) {
  const CARD_W = 380;
  const GAP = 28;
  const SPEED = 0.7;

  const items = [...customers, ...customers, ...customers]; // triple for safe looping
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const loopAt = customers.length * (CARD_W + GAP);

  const [selected, setSelected] = useState<Customer | null>(null);

  const tick = () => {
    if (!pausedRef.current && trackRef.current) {
      posRef.current += SPEED;
      if (posRef.current >= loopAt) posRef.current -= loopAt;
      trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
    }
    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [customers.length]);

  return (
    <>
      <div
        className="overflow-hidden"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: GAP, width: 'max-content' }}
        >
          {items.map((c, i) => (
            <button
              key={`${c.id}-${i}`}
              onClick={() => setSelected(c)}
              className="group flex-shrink-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-white hover:shadow-2xl hover:border-primary/40 transition-all duration-300 cursor-pointer"
              style={{ width: CARD_W }}
            >
              {/* Big image area */}
              <div className="relative bg-gray-50" style={{ height: 260 }}>
                {c.logo_public_id ? (
                  <img
                    src={logoUrl(c.logo_public_id)}
                    alt={c.company_name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-5xl font-bold text-primary/20">
                    {c.company_name[0]}
                  </div>
                )}
              </div>
              {/* Name row */}
              <div className="px-5 py-4 border-t border-border bg-white">
                <p className="text-base font-semibold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                  {c.company_name}
                </p>
                {c.short_description && (
                  <p className="text-xs text-muted-foreground text-center line-clamp-1 mt-1">
                    {c.short_description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && <CustomerDialog customer={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-36 bg-gray-50">
        {customer.logo_public_id ? (
          <img
            src={logoUrl(customer.logo_public_id)}
            alt={customer.company_name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-3xl font-bold text-muted-foreground">
            {customer.company_name[0]}
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-border">
        <p className="text-xs font-semibold text-foreground text-center line-clamp-2 group-hover:text-primary transition-colors">
          {customer.company_name}
        </p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { data: allResponse } = useCustomers(1, 100, undefined, true);
  const allActive: Customer[] = allResponse?.data ?? [];

  const featured = [...allActive]
    .filter((c) => c.is_featured)
    .sort((a, b) => a.position - b.position);

  const regular = [...allActive]
    .filter((c) => !c.is_featured)
    .sort((a, b) => a.position - b.position);

  const [selected, setSelected] = useState<Customer | null>(null);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Carousel as page header ── */}
      {featured.length > 0 && (
        <section className="bg-gradient-to-b from-primary/8 to-background pt-14 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Trusted By</p>
            <h1 className="text-4xl font-bold text-foreground">Our Customers</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Companies, institutions and partners that trust Air Current Engineering Solutions.
            </p>
          </div>
          <RingCarousel customers={featured} />
        </section>
      )}

      {/* Page title when no featured customers */}
      {featured.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Trusted By</p>
          <h1 className="text-4xl font-bold text-foreground">Our Customers</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Companies, institutions and partners that trust Air Current Engineering Solutions.
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {regular.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {regular.map((c) => (
                <CustomerCard key={c.id} customer={c} onClick={() => setSelected(c)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {selected && <CustomerDialog customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
