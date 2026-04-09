import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  image?: string;
  href?: string;
  category?: string;
  details?: string;
  specs?: Record<string, string>;
  results?: string[];
  client?: string;
  industry?: string;
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  image,
  href,
  category,
  details,
  specs,
  results,
  client,
  industry,
}: FeatureCardProps) {
  const content = (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      {/* Image section */}
      {image && (
        <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden flex items-center justify-center">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Icon section */}
      {Icon && !image && (
        <div className="h-20 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <Icon size={40} className="text-primary" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        {/* Category badge */}
        {category && (
          <div className="inline-flex mb-3">
            <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-semibold rounded-full">
              {category}
            </span>
          </div>
        )}

        {/* Industry badge */}
        {industry && (
          <div className="inline-flex mb-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
              {industry}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground mb-2 text-balance">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 flex-1">{description}</p>

        {/* Client info */}
        {client && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Client</p>
            <p className="text-sm text-foreground font-medium">{client}</p>
          </div>
        )}

        {/* Details */}
        {details && (
          <p className="text-sm text-foreground mb-4 pb-4 border-b border-border">
            {details}
          </p>
        )}

        {/* Specifications */}
        {specs && Object.keys(specs).length > 0 && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Specifications</p>
            <ul className="space-y-1">
              {Object.entries(specs).map(([key, value]) => (
                <li key={key} className="text-sm text-foreground">
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Results</p>
            <ul className="space-y-1">
              {results.map((result, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start space-x-2">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>{result}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Link */}
        {href && (
          <Link
            href={href}
            className="inline-flex text-accent hover:text-accent/80 font-semibold text-sm transition-colors mt-auto"
          >
            Learn More →
          </Link>
        )}
      </div>
    </div>
  );

  if (href) {
    return <div className="cursor-pointer hover:opacity-95 transition-opacity">{content}</div>;
  }

  return content;
}
