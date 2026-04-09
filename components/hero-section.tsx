import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  variant?: 'home' | 'default';
}

export default function HeroSection({
  title,
  subtitle,
  description,
  ctaText = 'Get Started',
  ctaHref = '/contact',
  secondaryCtaText,
  secondaryCtaHref,
  variant = 'default',
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full -ml-36 -mb-36" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          {subtitle && (
            <p className="text-accent font-semibold text-sm uppercase tracking-wide mb-4">
              {subtitle}
            </p>
          )}
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            {title}
          </h1>

          {description && (
            <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 leading-relaxed text-pretty max-w-2xl">
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
            
            {secondaryCtaText && secondaryCtaHref && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground text-accent-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href={secondaryCtaHref}>{secondaryCtaText}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
