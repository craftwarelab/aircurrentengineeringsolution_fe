'use client';

import Link from 'next/link';
import {
  Package, Briefcase, MessageSquare, Tag, Building, Star,
  HelpCircle, ArrowRight, Users, TrendingUp, Clock,
  CheckCircle, AlertCircle, Circle, RefreshCw, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/lib/hooks/use-products';
import { useServices } from '@/lib/hooks/use-services';
import { useProjects } from '@/lib/hooks/use-projects';
import { useInquiries } from '@/lib/hooks/use-inquiries';
import { useTestimonials } from '@/lib/hooks/use-testimonials';
import { useFAQs } from '@/lib/hooks/use-faqs';
import { useCustomers } from '@/lib/hooks/use-customers';
import { useCategories } from '@/lib/hooks/use-categories';
import { useServiceCategories } from '@/lib/hooks/use-service-categories';
import { useTags } from '@/lib/hooks/use-tags';
import { useServiceTags } from '@/lib/hooks/use-service-tags';
import { useProjectTags } from '@/lib/hooks/use-project-tags';

// ─── helpers ──────────────────────────────────────────────────────────────────
function arr(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
}

function num(raw: any): number { return arr(raw).length; }

const STATUS_COLORS: Record<string, string> = {
  new:         'bg-blue-100 text-blue-700',
  pending:     'bg-yellow-100 text-yellow-700',
  contacted:   'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  new:         <Circle className="w-3 h-3" />,
  pending:     <Clock className="w-3 h-3" />,
  contacted:   <MessageSquare className="w-3 h-3" />,
  in_progress: <TrendingUp className="w-3 h-3" />,
  completed:   <CheckCircle className="w-3 h-3" />,
  cancelled:   <AlertCircle className="w-3 h-3" />,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, href, accent = false, loading = false,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; href: string; accent?: boolean; loading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className={`hover:shadow-md transition-all group cursor-pointer ${accent ? 'border-primary/30 bg-primary/5' : ''}`}>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
          ) : (
            <p className="text-3xl font-bold text-foreground">{value}</p>
          )}
          <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  // Real data
  const { data: productsRaw,  isLoading: loadingProducts  } = useProducts(1, 100);
  const { data: servicesRaw,  isLoading: loadingServices  } = useServices(1, 100);
  const { data: projectsRaw,  isLoading: loadingProjects  } = useProjects(1, 100);
  const { data: inquiriesRaw, isLoading: loadingInquiries } = useInquiries();
  const { data: testimonialsRaw } = useTestimonials();
  const { data: faqsRaw       } = useFAQs();
  const { data: customersRaw  } = useCustomers(1, 100);
  const { data: prodCatsRaw   } = useCategories();
  const { data: svcCatsRaw    } = useServiceCategories();
  const { data: prodTagsRaw   } = useTags();
  const { data: svcTagsRaw    } = useServiceTags();
  const { data: projTagsRaw   } = useProjectTags();

  const products     = arr(productsRaw);
  const services     = arr(servicesRaw);
  const projects     = arr(projectsRaw);
  const inquiries    = arr(inquiriesRaw);
  const testimonials = arr(testimonialsRaw);
  const faqs         = arr(faqsRaw);
  const customers    = arr(customersRaw);
  const prodCats     = arr(prodCatsRaw);
  const svcCats      = arr(svcCatsRaw);
  const prodTags     = arr(prodTagsRaw);
  const svcTags      = arr(svcTagsRaw);
  const projTags     = arr(projTagsRaw);

  // Derived counts
  const activeProducts  = products.filter((p: any)  => p.status === 'active').length;
  const featuredProducts= products.filter((p: any)  => p.is_featured).length;
  const activeServices  = services.filter((s: any)  => s.status === 'active').length;
  const activeProjects  = projects.filter((p: any)  => p.status === 'active').length;
  const newInquiries    = inquiries.filter((i: any)  => i.status === 'new').length;
  const openInquiries   = inquiries.filter((i: any)  => ['new','pending','contacted','in_progress'].includes(i.status)).length;
  const approvedTestimonials = testimonials.filter((t: any) => t.is_approved).length;
  const activeCustomers = customers.filter((c: any)  => c.is_active).length;
  const featuredCustomers = customers.filter((c: any) => c.is_featured).length;

  // Inquiry status breakdown
  const statusGroups: Record<string, number> = {};
  inquiries.forEach((i: any) => {
    statusGroups[i.status] = (statusGroups[i.status] || 0) + 1;
  });

  // Recent 6 inquiries
  const recentInquiries = [...inquiries]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* ── Alert: New Inquiries ── */}
      {newInquiries > 0 && (
        <Link href="/admin/inquiries">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm font-medium text-blue-800">
              You have <span className="font-bold">{newInquiries}</span> new {newInquiries === 1 ? 'inquiry' : 'inquiries'} waiting for review.
            </p>
            <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
          </div>
        </Link>
      )}

      {/* ── Primary KPIs ── */}
      <div>
        <SectionHeader title="Overview" sub="Live counts from all content areas" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatCard label="Products"    value={products.length}    sub={`${activeProducts} active · ${featuredProducts} featured`}   icon={Package}      href="/admin/products"    loading={loadingProducts}  accent />
          <StatCard label="Services"    value={services.length}    sub={`${activeServices} active`}                                    icon={Package}      href="/admin/services"    loading={loadingServices}  />
          <StatCard label="Projects"    value={projects.length}    sub={`${activeProjects} active`}                                    icon={Briefcase}    href="/admin/projects"    loading={loadingProjects}  />
          <StatCard label="Inquiries"   value={inquiries.length}   sub={`${openInquiries} open · ${newInquiries} new`}                 icon={MessageSquare}href="/admin/inquiries"   loading={loadingInquiries} accent={newInquiries > 0} />
          <StatCard label="Customers"   value={customers.length}   sub={`${activeCustomers} active · ${featuredCustomers} featured`}   icon={Building}     href="/admin/customers"   />
          <StatCard label="Testimonials"value={testimonials.length}sub={`${approvedTestimonials} approved`}                            icon={Star}         href="/admin/testimonials"/>
          <StatCard label="FAQs"        value={faqs.length}        sub="Help articles"                                                 icon={HelpCircle}   href="/admin/faqs"        />
          <StatCard label="Prod. Cats"  value={prodCats.length}    sub="Product categories"                                            icon={Tag}          href="/admin/product-categories" />
          <StatCard label="Svc. Cats"   value={svcCats.length}     sub="Service categories"                                            icon={Tag}          href="/admin/service-categories" />
          <StatCard label="Tags"        value={prodTags.length + svcTags.length + projTags.length} sub={`${prodTags.length}P · ${svcTags.length}S · ${projTags.length}Pr`} icon={Tag} href="/admin/product-tags" />
        </div>
      </div>

      {/* ── Middle row: Inquiry status + Recent inquiries ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Inquiry status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inquiry Status</CardTitle>
            <CardDescription>All {inquiries.length} inquiries by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Object.entries(STATUS_COLORS).map(([status, cls]) => {
              const count = statusGroups[status] || 0;
              const pct   = inquiries.length ? Math.round((count / inquiries.length) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                      {STATUS_ICON[status]}
                      {status.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {inquiries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No inquiries yet</p>
            )}
            <Link href="/admin/inquiries" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Manage Inquiries <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent inquiries feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Inquiries</CardTitle>
                <CardDescription>Latest submissions — newest first</CardDescription>
              </div>
              <Link href="/admin/inquiries">
                <Button variant="ghost" size="sm">View all <ExternalLink className="w-3.5 h-3.5 ml-1.5" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInquiries ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No inquiries yet</p>
            ) : (
              <div className="space-y-2">
                {recentInquiries.map((inq: any) => (
                  <Link key={inq.id} href="/admin/inquiries">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                        {(inq.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{inq.full_name}</p>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${STATUS_COLORS[inq.status] || 'bg-muted text-muted-foreground'}`}>
                            {inq.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {inq.service_types?.slice(0, 2).join(', ') || inq.project_location}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick navigation ── */}
      <div>
        <SectionHeader title="Quick Navigation" sub="Jump to any management section" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Product Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Products',        href: '/admin/products',              count: products.length,  sub: `${activeProducts} active` },
                { label: 'Categories',      href: '/admin/product-categories',    count: prodCats.length,  sub: '' },
                { label: 'Subcategories',   href: '/admin/product-subcategories', count: null,             sub: '' },
                { label: 'Tags',            href: '/admin/product-tags',          count: prodTags.length,  sub: '' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.count !== null && <span className="text-xs text-muted-foreground">{item.count}</span>}
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Service Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Services',        href: '/admin/services',              count: services.length,  sub: `${activeServices} active` },
                { label: 'Categories',      href: '/admin/service-categories',    count: svcCats.length,   sub: '' },
                { label: 'Subcategories',   href: '/admin/service-subcategories', count: null,             sub: '' },
                { label: 'Tags',            href: '/admin/service-tags',          count: svcTags.length,   sub: '' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.count !== null && <span className="text-xs text-muted-foreground">{item.count}</span>}
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Project Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Projects',  href: '/admin/projects',      count: projects.length, sub: `${activeProjects} active` },
                { label: 'Tags',      href: '/admin/project-tags',  count: projTags.length, sub: '' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'Customers',     href: '/admin/customers',    count: customers.length,    sub: `${activeCustomers} active` },
                { label: 'Testimonials',  href: '/admin/testimonials', count: testimonials.length, sub: `${approvedTestimonials} approved` },
                { label: 'FAQs',          href: '/admin/faqs',         count: faqs.length,         sub: '' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Communications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Link href="/admin/inquiries" className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                <span className="text-sm text-foreground">All Inquiries</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{inquiries.length}</span>
                  {newInquiries > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-600 text-white rounded-full">{newInquiries} new</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Link href="/admin/profile" className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                <span className="text-sm text-foreground">My Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Content health ── */}
      <div>
        <SectionHeader title="Content Health" sub="Active vs total across main content types" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Products',     active: activeProducts,    total: products.length,     href: '/admin/products'    },
            { label: 'Services',     active: activeServices,    total: services.length,     href: '/admin/services'    },
            { label: 'Projects',     active: activeProjects,    total: projects.length,     href: '/admin/projects'    },
            { label: 'Customers',    active: activeCustomers,   total: customers.length,    href: '/admin/customers'   },
          ].map(item => {
            const pct = item.total ? Math.round((item.active / item.total) * 100) : 0;
            return (
              <Link key={item.label} href={item.href}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="pt-4 pb-4 px-5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <span className="text-xs text-muted-foreground">{item.active}/{item.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-1.5">
                      <div
                        className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{pct}% active</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
