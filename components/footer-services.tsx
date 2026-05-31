'use client';

import Link from 'next/link';
import { useServices } from '@/lib/hooks/use-services';

export default function FooterServices() {
  const { data } = useServices(1, 10, 'active');

  const raw = data as any;
  const allServices: any[] = Array.isArray(raw?.data?.data)
    ? raw.data.data
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  const featured = allServices
    .filter((s) => s.is_featured)
    .slice(0, 6);

  const services = featured.length > 0 ? featured : allServices.slice(0, 6);

  return (
    <ul className="space-y-2 text-sm">
      {services.map((service) => (
        <li key={service.id}>
          <Link
            href={`/services`}
            className="hover:text-accent transition-colors"
          >
            {service.name}
          </Link>
        </li>
      ))}
      <li>
        <Link href="/services" className="hover:text-accent transition-colors font-medium">
          View All Services →
        </Link>
      </li>
    </ul>
  );
}
