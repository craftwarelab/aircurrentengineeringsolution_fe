'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  LayoutDashboard,
  Users,
  Package,
  Briefcase,
  MessageSquare,
  Tag,
  Building,
  Star,
  HelpCircle,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const navSections = [
  {
    title: 'Dashboard',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'User Management',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
    ]
  },
  {
    title: 'Product Management',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/product-categories', label: 'Product Categories', icon: Tag },
      { href: '/admin/product-subcategories', label: 'Product Subcategories', icon: Tag },
      { href: '/admin/product-tags', label: 'Product Tags', icon: Tag },
    ]
  },
  {
    title: 'Service Management',
    items: [
      { href: '/admin/services', label: 'Services', icon: Package },
      { href: '/admin/service-categories', label: 'Service Categories', icon: Tag },
      { href: '/admin/service-subcategories', label: 'Service Subcategories', icon: Tag },
      { href: '/admin/service-tags', label: 'Service Tags', icon: Tag },
    ]
  },
  {
    title: 'Project Management',
    items: [
      { href: '/admin/projects', label: 'Projects', icon: Briefcase },
      { href: '/admin/project-tags', label: 'Project Tags', icon: Tag },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { href: '/admin/customer-showcases', label: 'Customer Showcases', icon: Building },
      { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
      { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    ]
  },
  {
    title: 'Communications',
    items: [
      { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
    ]
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Dashboard', 'User Management']));
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    // Check authentication
    const isAuth = document.cookie.includes('admin_auth=true');
    if (!isAuth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }

    // Auto-expand section containing current page (only if user hasn't manually interacted)
    if (!hasUserInteracted) {
      const currentSection = navSections.find(section =>
        section.items.some(item => item.href === pathname)
      );
      if (currentSection && !expandedSections.has(currentSection.title)) {
        setExpandedSections(prev => new Set([...prev, currentSection.title]));
      }
    }
  }, [pathname, hasUserInteracted]);

  // For login page, render without admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = 'admin_auth=; path=/; max-age=0';
    router.push('/admin/login');
  };

  const toggleSection = (sectionTitle: string) => {
    setHasUserInteracted(true);
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-1">
                {navSections.map((section, index) => (
                  <div key={section.title}>
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleSection(section.title)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <span>{section.title}</span>
                        {expandedSections.has(section.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedSections.has(section.title) && (
                        <div className="ml-4 space-y-1">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                              >
                                <Icon className="h-4 w-4 mr-3" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {index < navSections.length - 1 && (
                      <div className="my-4 border-t border-gray-200"></div>
                    )}
                  </div>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}