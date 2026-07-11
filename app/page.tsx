'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Users, Award, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TestimonialsSection from '@/components/testimonials-section';
import FAQSection from '@/components/faq-section';
import { useServices } from '@/lib/hooks/use-services';
import { useProjects } from '@/lib/hooks/use-projects';
import { useFeaturedCustomers, type Customer } from '@/lib/hooks/use-customers';
import { useProducts } from '@/lib/hooks/use-products';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

// ─── Hero Slider ──────────────────────────────────────────────────────────────
const SLIDES = [
  {
    headline: 'Professional HVAC & Ventilation Solutions',
    sub: 'Precision-engineered air systems for commercial & industrial facilities across Sri Lanka.',
    cta: { label: 'Submit an Inquiry', href: '/inquiries' },
    bg: 'from-primary/95 via-primary/80 to-primary/60',
    img: '/home/one.jpg',
  },
  {
    headline: 'Design. Install. Maintain.',
    sub: 'End-to-end engineering services — from concept design through commissioning and long-term support.',
    cta: { label: 'View Our Services', href: '/services' },
    bg: 'from-primary via-primary/85 to-accent/40',
    img: '/home/two.jpg',
  },
  {
    headline: 'Energy Efficiency First',
    sub: 'Our systems cut energy consumption by up to 35%, saving you money while reducing your carbon footprint.',
    cta: { label: 'Explore Projects', href: '/projects' },
    bg: 'from-primary/90 via-primary/70 to-primary/50',
    img: '/home/three.jpg',
  },
];

function HeroSlider() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    timer.current = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 5000);
  };
  const stop = () => { if (timer.current) clearInterval(timer.current); };

  useEffect(() => { start(); return stop; }, []);

  const go = (dir: 1 | -1) => {
    stop();
    setActive((p) => (p + dir + SLIDES.length) % SLIDES.length);
    start();
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: '1920/620' }}>
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Background photo */}
          <img
            src={slide.img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay on top of photo */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />
          {/* decorative circles */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full -mr-48 -mt-48 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full -ml-32 -mb-32 pointer-events-none" />

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-4">
                  Air Current Engineering Solutions
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                  {slide.headline}
                </h1>
                <p className="text-lg text-white/85 mb-8 leading-relaxed">{slide.sub}</p>
                <div className="flex gap-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    <Link href={slide.cta.href}>{slide.cta.label}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                    <Link href="/about">About Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { stop(); setActive(i); start(); }}
            className={`w-2 h-2 rounded-full transition-all ${i === active ? 'bg-accent w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const STATS = [
  { value: '1500+', label: 'Projects Completed' },
  { value: '15+', label: 'Years Experience' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '16+', label: 'Team Members' },
];

// ─── Services Tabs ────────────────────────────────────────────────────────────
function ServicesSection() {
  const { data: raw } = useServices(1, 20, 'active');
  const services: any[] = Array.isArray(raw) ? raw : ((raw as any)?.data?.data ?? []);
  const [active, setActive] = useState(0);

  if (!services.length) return null;

  const current = services[active];
  const mainImg = current?.images?.find((i: any) => i.is_main)?.url
    || current?.images?.[0]?.url;

  return (
    <section className="bg-muted/40 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-10">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">What We Offer</p>
          <h2 className="text-3xl font-bold text-foreground">Our Services</h2>
        </div>

        {/* Tab Nav */}
        <div className="flex overflow-x-auto gap-1 mb-8 pb-1 scrollbar-hide border-b border-border">
          {services.map((s: any, i: number) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                i === active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Active service content */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-muted aspect-video relative">
            {mainImg ? (
              <Image
                src={getCloudinaryImageUrl(mainImg, { width: 800, height: 450, crop: 'fill' })}
                alt={current.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
                <span className="text-4xl font-bold text-primary/30">{current.name[0]}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-3">{current.name}</h3>
            {current.short_description && (
              <p className="text-muted-foreground mb-4">{current.short_description}</p>
            )}
            {current.description && (
              <p className="text-muted-foreground text-sm line-clamp-4 mb-6">{current.description}</p>
            )}
            <div className="flex gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/inquiries">Submit an Inquiry <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/services">All Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] relative">
              <Image
                src="/home/pexels-mikhail-nilov-8297856.webp"
                alt="Air Current Engineering Solutions"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl">
              <p className="text-4xl font-black">15`+</p>
              <p className="text-sm text-primary-foreground/80">Years of Excellence</p>
            </div>
          </div>

          {/* Text side */}
          <div>
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
              About Us
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sri Lanka's Trusted HVAC Engineering Partner
            </h2>
            <p className="text-muted-foreground mb-4">
              Air Current Engineering Solutions is a leading HVAC and ventilation engineering company committed to delivering precision-engineered air systems. We serve commercial, industrial, and institutional clients across Sri Lanka with end-to-end solutions.
            </p>
            <p className="text-muted-foreground mb-8">
              Our dedicated team of certified engineers combines German-standard design principles with deep local expertise to build systems that perform reliably for decades.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { n: '1500+', l: 'Projects Completed' },
                { n: '`1500+', l: 'Happy Clients' },
                { n: '15+', l: 'Years Experience' },
                { n: '16+', l: 'Team Members' },
              ].map((s, i) => (
                <div key={i} className="bg-muted/60 rounded-xl p-4">
                  <p className="text-2xl font-bold text-primary">{s.n}</p>
                  <p className="text-sm text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>

            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/about">Learn More <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
const WHY = [
  {
    icon: Award,
    title: 'Certified Engineering Standards',
    desc: 'All designs follow international ASHRAE and CIBSE standards with local compliance — ensuring systems built to last.',
  },
  {
    icon: Users,
    title: 'Dedicated Expert Team',
    desc: 'Our certified mechanical engineers bring decades of combined experience in HVAC design, installation, and commissioning.',
  },
  {
    icon: Shield,
    title: 'Island-wide Coverage & Support',
    desc: 'We serve clients across Sri Lanka with on-site assessments, rapid maintenance response, and after-sales warranty.',
  },
];

function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Our Strengths</p>
          <h2 className="text-3xl font-bold text-foreground mb-3">Why Choose Air Current?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            International engineering standards backed by Sri Lankan expertise and responsive local service.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {WHY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl group-hover:w-2 transition-all" />
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Projects Strip ───────────────────────────────────────────────────────────
function ProjectsStrip() {
  const { data: raw } = useProjects(1, 10, 'active');
  const projects: any[] = Array.isArray(raw) ? raw : ((raw as any)?.data?.data ?? []);
  const stripRef = useRef<HTMLDivElement>(null);

  if (!projects.length) return null;

  const scroll = (dir: 1 | -1) => {
    if (stripRef.current) stripRef.current.scrollLeft += dir * 320;
  };

  return (
    <section className="bg-primary py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-1">Our Work</p>
            <h2 className="text-3xl font-bold text-white">Featured Projects</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-white/30 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-white/30 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={stripRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {projects.map((p: any) => {
            const img = p.images?.find((i: any) => i.is_main)?.url || p.images?.[0]?.url;
            return (
              <div key={p.id} className="flex-shrink-0 w-72 rounded-xl overflow-hidden bg-primary-foreground/5 border border-white/10 group">
                <div className="relative h-44 bg-white/10">
                  {img ? (
                    <Image
                      src={getCloudinaryImageUrl(img, { width: 300, height: 176, crop: 'fill' })}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/20 text-5xl font-black">{p.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-semibold text-sm line-clamp-2">{p.title}</h4>
                  {p.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tags.slice(0, 2).map((t: any) => (
                        <Badge key={t.id} variant="outline" className="text-white/60 border-white/20 text-xs">{t.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href="/projects">View All Projects <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Services — fade 2 at a time ────────────────────────────────────
function FeaturedServicesSection() {
  const { data: res } = useServices(1, 50, 'active');
  const raw = res as any;
  const allServices: any[] = (raw?.data?.data || raw?.data || []).filter((s: any) => s.is_featured);

  const PER_PAGE = 2;
  const HOLD_MS  = 4000;
  const FADE_MS  = 500;

  const totalPages = allServices.length > 0
    ? Math.ceil(allServices.length / PER_PAGE)
    : 0;

  const [page,     setPage]     = useState(0);
  const [visible,  setVisible]  = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  // All mutable cycle state lives in a ref — never causes effect re-runs
  const cycleRef = useRef({
    page: 0,
    paused: false,
    totalPages: 0,
    running: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync with latest totalPages without re-running the effect
  cycleRef.current.totalPages = totalPages;

  // Single effect — starts cycle once data arrives, never restarts
  useEffect(() => {
    if (totalPages < 2) return;
    if (cycleRef.current.running) return; // guard against StrictMode double-invoke
    cycleRef.current.running = true;
    cycleRef.current.page    = 0;
    setPage(0);
    setVisible(true);

    const runCycle = () => {
      // Respect pause — poll every 500 ms while paused
      if (cycleRef.current.paused) {
        timerRef.current = setTimeout(runCycle, 500);
        return;
      }

      // Fade out
      setVisible(false);

      timerRef.current = setTimeout(() => {
        // Advance page while invisible
        cycleRef.current.page = (cycleRef.current.page + 1) % cycleRef.current.totalPages;
        setPage(cycleRef.current.page);

        // Fade in
        setVisible(true);

        // Hold, then next cycle
        timerRef.current = setTimeout(runCycle, HOLD_MS);
      }, FADE_MS);
    };

    timerRef.current = setTimeout(runCycle, HOLD_MS);

    return () => {
      cycleRef.current.running = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages >= 2]); // only fires when crossing the threshold

  const jumpToPage = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    timerRef.current = setTimeout(() => {
      cycleRef.current.page = i;
      setPage(i);
      setVisible(true);
      timerRef.current = setTimeout(() => {
        const runCycle = () => {
          if (cycleRef.current.paused) { timerRef.current = setTimeout(runCycle, 500); return; }
          setVisible(false);
          timerRef.current = setTimeout(() => {
            cycleRef.current.page = (cycleRef.current.page + 1) % cycleRef.current.totalPages;
            setPage(cycleRef.current.page);
            setVisible(true);
            timerRef.current = setTimeout(runCycle, HOLD_MS);
          }, FADE_MS);
        };
        timerRef.current = setTimeout(runCycle, HOLD_MS);
      }, FADE_MS);
    }, FADE_MS);
  };

  if (!allServices.length) return null;

  const visiblePair    = allServices.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-1">What We Offer</p>
            <h2 className="text-3xl font-bold text-foreground">Featured Services</h2>
          </div>
          <Link
            href="/services"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards — single opacity transition on the grid wrapper */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
          onMouseEnter={() => { cycleRef.current.paused = true; }}
          onMouseLeave={() => { cycleRef.current.paused = false; }}
        >
          {[0, 1].map((slot) => {
            const s = visiblePair[slot];
            if (!s) return <div key={`empty-${slot}`} className="hidden sm:block" />;
            const mainImg = s.images?.find((img: any) => img.is_main)?.url || s.images?.[0]?.url;

            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl hover:border-primary/40 transition-shadow duration-300 cursor-pointer text-left w-full"
              >
                <div className="relative w-full overflow-hidden" style={{ height: 240 }}>
                  {mainImg ? (
                    <img
                      src={getCloudinaryImageUrl(mainImg, { width: 600, height: 240, crop: 'fill' })}
                      alt={s.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <span className="text-6xl font-black text-primary/20">{s.name?.[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 bg-accent text-accent-foreground rounded-full font-semibold tracking-wide">
                    Featured
                  </span>
                </div>
                <div className="flex-1 px-6 py-5 flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {s.name}
                  </h3>
                  {s.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{s.short_description}</p>
                  )}
                  {s.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {s.categories.slice(0, 3).map((c: any) => (
                        <span key={c.id} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">{c.name}</span>
                      ))}
                    </div>
                  )}
                  <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dot indicators */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => jumpToPage(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === page ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-primary/40'}`}
                aria-label={`Go to service pair ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Service detail dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const mainImg = selected.images?.find((img: any) => img.is_main)?.url || selected.images?.[0]?.url;
              return mainImg ? (
                <div className="relative w-full h-64 bg-gray-100 overflow-hidden rounded-t-2xl">
                  <img src={getCloudinaryImageUrl(mainImg, { width: 800, height: 400, crop: 'fill' })} alt={selected.name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ) : null;
            })()}
            <div className="p-6">
              <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                <a href="/" className="hover:text-foreground transition-colors">Home</a>
                <span>/</span>
                <a href="/services" className="hover:text-foreground transition-colors">Services</a>
                {selected.slug && (<><span>/</span><a href={`/services/${selected.slug}`} className="hover:text-foreground transition-colors text-foreground font-medium">{selected.name}</a></>)}
              </nav>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs px-2.5 py-0.5 bg-accent text-accent-foreground rounded-full">Featured</span>
                {selected.categories?.map((c: any) => (
                  <span key={c.id} className="text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full">{c.name}</span>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{selected.name}</h2>
              {(selected.short_description || selected.description) && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{selected.short_description || selected.description}</p>
              )}
              {selected.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selected.tags.map((t: any) => (
                    <span key={t.id} className="text-xs px-2 py-0.5 border border-border rounded-full text-muted-foreground">#{t.name}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                {selected.slug && (
                  <a href={`/services/${selected.slug}`} className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors text-sm">
                    View Full Details
                  </a>
                )}
                <a href={`/inquiries?service=${encodeURIComponent(selected.name)}${selected.slug ? `&ref=/services/${selected.slug}` : ''}`} className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors text-sm">
                  Submit an Inquiry
                </a>
                <button onClick={() => setSelected(null)} className="px-5 py-3 border border-border hover:bg-muted rounded-xl text-sm transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Featured Products Ring ───────────────────────────────────────────────────
function FeaturedProductsSection() {
  const { data: res } = useProducts(1, 50, 'active');
  const raw = res as any;
  const allProducts: any[] = (raw?.data?.data || raw?.data || []).filter((p: any) => p.is_featured);

  const CARD_W = 280;
  const GAP = 20;
  const SPEED = 0.6;
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const [selected, setSelected] = useState<any | null>(null);

  const items = allProducts.length > 0 ? [...allProducts, ...allProducts, ...allProducts] : [];
  const loopAt = allProducts.length * (CARD_W + GAP);

  useEffect(() => {
    if (!allProducts.length) return;
    const tick = () => {
      if (!pausedRef.current && trackRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= loopAt) posRef.current -= loopAt;
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [allProducts.length, loopAt]);

  if (!allProducts.length) return null;

  return (
    <section className="py-14 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-1">Our Products</p>
        <h2 className="text-3xl font-bold text-foreground mb-8">Featured Products</h2>

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
          {items.map((p: any, i: number) => {
            const mainImg = p.images?.find((img: any) => img.is_main)?.url || p.images?.[0]?.url;
            const displayPrice = Number(p.sale_price) || Number(p.price);
            return (
              <button
                key={`${p.id}-${i}`}
                onClick={() => setSelected(p)}
                className="group flex-shrink-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-white hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer"
                style={{ width: CARD_W }}
              >
                <div className="relative bg-gray-50" style={{ height: 200 }}>
                  {mainImg ? (
                    <img
                      src={getCloudinaryImageUrl(mainImg, { width: 400, height: 200, crop: 'fill' })}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-4xl">
                      ❄️
                    </div>
                  )}
                  {p.sale_price && Number(p.sale_price) > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-red-500 text-white rounded-full font-semibold">SALE</span>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-border bg-white flex-1 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-left">
                    {p.name}
                  </p>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Product Dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            {(() => {
              const mainImg = selected.images?.find((img: any) => img.is_main)?.url || selected.images?.[0]?.url;
              return mainImg ? (
                <div className="relative w-full h-64 bg-gray-100 overflow-hidden rounded-t-2xl">
                  <img
                    src={getCloudinaryImageUrl(mainImg, { width: 800, height: 400, crop: 'fill' })}
                    alt={selected.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : null;
            })()}

            <div className="p-6">
              {/* Breadcrumb — SEO-friendly visible path */}
              <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                <a href="/" className="hover:text-foreground transition-colors">Home</a>
                <span>/</span>
                <a href="/products" className="hover:text-foreground transition-colors">Products</a>
                {selected.slug && (
                  <>
                    <span>/</span>
                    <a href={`/products/${selected.slug}`} className="hover:text-foreground transition-colors text-foreground font-medium">{selected.name}</a>
                  </>
                )}
              </nav>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selected.is_featured && (
                  <span className="text-xs px-2.5 py-0.5 bg-accent text-accent-foreground rounded-full">Featured</span>
                )}
                {selected.categories?.map((c: any) => (
                  <span key={c.id} className="text-xs px-2.5 py-0.5 bg-accent/10 text-accent rounded-full">{c.name}</span>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-1">{selected.name}</h2>
              {selected.model && <p className="text-sm text-muted-foreground mb-3">Model: {selected.model}</p>}

              {/* Price - hidden */}
              {(Number(selected.sale_price) > 0 || Number(selected.price) > 0) && (
                <div className="flex items-baseline gap-2 mb-4 hidden">
                  <span className="text-2xl font-bold">${(Number(selected.sale_price) || Number(selected.price)).toLocaleString()}</span>
                  {selected.sale_price && Number(selected.sale_price) < Number(selected.price) && (
                    <span className="text-base text-muted-foreground line-through">${Number(selected.price).toLocaleString()}</span>
                  )}
                </div>
              )}

              {(selected.short_description || selected.description) && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {selected.short_description || selected.description}
                </p>
              )}

              {/* Tags */}
              {selected.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selected.tags.map((t: any) => (
                    <span key={t.id} className="text-xs px-2 py-0.5 border border-border rounded-full text-muted-foreground">#{t.name}</span>
                  ))}
                </div>
              )}

              {/* CTAs — all use SEO-friendly slug-based hrefs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                {selected.slug && (
                  <a
                    href={`/products/${selected.slug}`}
                    className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors text-sm"
                  >
                    View Full Details
                  </a>
                )}
                <a
                  href={`/inquiries?product=${encodeURIComponent(selected.name)}${selected.slug ? `&ref=/products/${selected.slug}` : ''}`}
                  className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl transition-colors text-sm"
                >
                  Submit an Inquiry
                </a>
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-3 border border-border hover:bg-muted rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Customers Section ────────────────────────────────────────────────────────
function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  const logoUrl = customer.logo_public_id
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${customer.logo_public_id}`
    : null;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden bg-white border border-border rounded-2xl hover:shadow-md hover:border-primary/30 transition-all cursor-pointer w-44"
    >
      <div className="relative w-full h-28 bg-gray-50">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={customer.company_name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-2xl font-bold text-gray-300">
            {customer.company_name[0]}
          </div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-border">
        <p className="text-xs font-semibold text-foreground text-center line-clamp-2 group-hover:text-primary transition-colors">
          {customer.company_name}
        </p>
      </div>
    </button>
  );
}

function CustomersSection() {
  const { data: raw } = useFeaturedCustomers(20);
  const customers: Customer[] = Array.isArray(raw?.data) ? raw.data : [];
  const [selected, setSelected] = useState<Customer | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const hovered = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleCount = 4;

  const sorted = [...customers].sort((a, b) => a.position - b.position);
  const canScroll = sorted.length > visibleCount;

  const logoUrl = (c: Customer) => c.logo_public_id
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${c.logo_public_id}`
    : null;

  const advance = (dir: 1 | -1) => {
    setCurrentIndex((p) => {
      const next = dir === 1
        ? (p >= sorted.length - visibleCount ? 0 : p + 1)
        : (p === 0 ? sorted.length - visibleCount : p - 1);
      // mark newly visible cards so they fade in
      setVisibleSet(new Set(Array.from({ length: visibleCount }, (_, i) => next + i)));
      return next;
    });
  };

  const startAuto = () => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      if (!hovered.current) advance(1);
    }, 3000);
  };

  const stopAuto = () => {
    if (autoTimer.current) { clearInterval(autoTimer.current); autoTimer.current = null; }
  };

  const handleMouseEnter = () => {
    hovered.current = true;
    stopAuto();
    if (resumeTimer.current) { clearTimeout(resumeTimer.current); resumeTimer.current = null; }
  };

  const handleMouseLeave = () => {
    hovered.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => startAuto(), 30000);
  };

  const handleManual = (dir: 1 | -1) => {
    advance(dir);
    stopAuto();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => startAuto(), 30000);
  };

  useEffect(() => {
    if (!canScroll) return;
    startAuto();
    return () => {
      stopAuto();
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [sorted.length]);

  if (!customers.length) return null;

  return (
    <section className="py-16 bg-background">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Trusted By</p>
            <h2 className="text-3xl font-bold text-foreground">Our Customers</h2>
            <p className="text-muted-foreground mt-2">
              Companies and organisations that partner and work with us.
            </p>
          </div>
          {canScroll && (
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="icon" onClick={() => handleManual(-1)} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleManual(1)} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
          >
            {sorted.map((c, idx) => {
              const isVisible = visibleSet.has(idx);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`group flex-shrink-0 w-[calc(25%-12px)] flex flex-col overflow-hidden bg-white border border-border rounded-2xl hover:shadow-md hover:border-primary/30 transition-all duration-700 cursor-pointer ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'
                  }`}
                >
                  <div className="relative w-full h-40 bg-gray-50">
                    {logoUrl(c) ? (
                      <img
                        src={logoUrl(c)!}
                        alt={c.company_name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-2xl font-bold text-gray-300">
                        {c.company_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-border">
                    <p className="text-xs font-semibold text-foreground text-center line-clamp-2 group-hover:text-primary transition-colors">
                      {c.company_name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {canScroll && (
          <div className="flex sm:hidden justify-center gap-2 mt-6">
            <Button variant="outline" size="icon" onClick={() => handleManual(-1)} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleManual(1)} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{selected?.company_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col items-center gap-5 py-4">
              {logoUrl(selected) ? (
                <img
                  src={logoUrl(selected)!}
                  alt={selected.company_name}
                  className="max-h-32 max-w-[220px] object-contain"
                />
              ) : (
                <div className="h-20 w-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  {selected.company_name[0]}
                </div>
              )}
              {selected.short_description && (
                <p className="text-muted-foreground text-sm text-center">{selected.short_description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="bg-accent py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-accent-foreground mb-4">
          Ready to Optimize Your Air System?
        </h2>
        <p className="text-accent-foreground/80 mb-8 max-w-xl mx-auto">
          Contact our engineering team today for a free consultation and discover how we can improve your facility's comfort and efficiency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="/inquiries">Submit an Inquiry</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Floating Contact Bar ─────────────────────────────────────────────────────
function FloatingContact() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1">
      {[
        { icon: Phone, label: 'Call', href: 'tel:+94701533195' },
        { icon: Mail, label: 'Email', href: 'mailto:info@aircurrentengineeringsolution.com' },
        { icon: MapPin, label: 'Map', href: '/contact' },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.label}
            href={item.href}
            className="group flex items-center bg-primary text-primary-foreground rounded-l-xl px-3 py-3 shadow-lg hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] group-hover:ml-2 transition-all duration-300 text-xs font-medium whitespace-nowrap">
              {item.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <FloatingContact />

      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Stats Bar */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.value}>
                <p className="text-4xl font-black text-accent">{s.value}</p>
                <p className="text-sm text-primary-foreground/80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Services Tabs */}
      <ServicesSection />

      {/* 4. About */}
      <AboutSection />

      {/* 5. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 6. Projects Strip */}
      <ProjectsStrip />

      {/* 7. Featured Services */}
      <FeaturedServicesSection />

      {/* 8. Featured Products */}
      <FeaturedProductsSection />

      {/* 9. Customers */}
      <CustomersSection />

      {/* 10. Testimonials */}
      <TestimonialsSection />

      {/* 11. FAQ */}
      <FAQSection />

      {/* 12. CTA */}
      <CTASection />
    </>
  );
}
