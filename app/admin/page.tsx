'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getServices,
  getProducts,
  getProjects,
  getContactInquiries,
  getUsers,
  getProductCategories,
  getProductTags,
  getProductSubcategories,
  getServiceCategories,
  getServiceTags,
  getServiceSubcategories,
  getProjectTags,
  getCustomerShowcases,
  getTestimonials,
  getFAQs,
  getInquiries
} from '@/lib/mockDatabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Package, Briefcase, MessageSquare, Tag, Building, Star, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const services = getServices();
  const products = getProducts();
  const projects = getProjects();
  const inquiries = getContactInquiries();
  const users = getUsers();
  const productCategories = getProductCategories();
  const productTags = getProductTags();
  const serviceCategories = getServiceCategories();
  const serviceTags = getServiceTags();
  const projectTags = getProjectTags();
  const customerShowcases = getCustomerShowcases();
  const testimonials = getTestimonials();
  const faqs = getFAQs();
  const allInquiries = getInquiries();

  // Quick action sections
  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      items: [
        { label: 'Users', href: '/admin/users', count: users.length, active: users.filter(u => u.is_active).length }
      ]
    },
    {
      title: 'Product Management',
      description: 'Manage products and related content',
      items: [
        { label: 'Products', href: '/admin/products', count: products.length },
        { label: 'Categories', href: '/admin/product-categories', count: productCategories.length },
        { label: 'Subcategories', href: '/admin/product-subcategories', count: getProductSubcategories().length },
        { label: 'Tags', href: '/admin/product-tags', count: productTags.length }
      ]
    },
    {
      title: 'Service Management',
      description: 'Manage services and related content',
      items: [
        { label: 'Services', href: '/admin/services', count: services.length },
        { label: 'Categories', href: '/admin/service-categories', count: serviceCategories.length },
        { label: 'Subcategories', href: '/admin/service-subcategories', count: getServiceSubcategories().length },
        { label: 'Tags', href: '/admin/service-tags', count: serviceTags.length }
      ]
    },
    {
      title: 'Project Management',
      description: 'Manage projects and related content',
      items: [
        { label: 'Projects', href: '/admin/projects', count: projects.length },
        { label: 'Tags', href: '/admin/project-tags', count: projectTags.length }
      ]
    },
    {
      title: 'Content Management',
      description: 'Manage customer content and FAQs',
      items: [
        { label: 'Customer Showcases', href: '/admin/customer-showcases', count: customerShowcases.length },
        { label: 'Testimonials', href: '/admin/testimonials', count: testimonials.length },
        { label: 'FAQs', href: '/admin/faqs', count: faqs.length }
      ]
    },
    {
      title: 'Communications',
      description: 'Handle customer inquiries',
      items: [
        { label: 'Inquiries', href: '/admin/inquiries', count: allInquiries.length, active: inquiries.filter(i => i.status === 'new').length }
      ]
    }
  ];

  // Calculate metrics
  const totalServices = services.length;
  const totalProducts = products.length;
  const totalProjects = projects.length;
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const totalProductCategories = productCategories.length;
  const totalServiceCategories = serviceCategories.length;
  const totalProductTags = productTags.length;
  const totalServiceTags = serviceTags.length;
  const totalProjectTags = projectTags.length;
  const totalCustomerShowcases = customerShowcases.length;
  const totalTestimonials = testimonials.length;
  const approvedTestimonials = testimonials.filter(t => t.is_approved).length;
  const totalFAQs = faqs.length;
  const totalAllInquiries = allInquiries.length;

  // Prepare chart data - temporarily disabled due to interface changes
  const categoryData = [
    { name: 'Design & Engineering', value: 3 },
    { name: 'Installation', value: 2 },
    { name: 'Maintenance', value: 2 },
    { name: 'Consulting', value: 2 },
  ];

  const inquiryStatusData = [
    { name: 'New', value: inquiries.filter(i => i.status === 'new').length },
    { name: 'Read', value: inquiries.filter(i => i.status === 'read').length },
    { name: 'Replied', value: inquiries.filter(i => i.status === 'replied').length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to your admin dashboard. Here's an overview of your content.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">Active services offered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">Projects completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              {newInquiries} new inquiries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductCategories}</div>
            <p className="text-xs text-muted-foreground">Product organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServiceCategories}</div>
            <p className="text-xs text-muted-foreground">Service organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestimonials}</div>
            <p className="text-xs text-muted-foreground">{approvedTestimonials} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Showcases</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomerShowcases}</div>
            <p className="text-xs text-muted-foreground">Case studies</p>
          </CardContent>
        </Card>
      </div>

      {/* Tertiary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductTags}</div>
            <p className="text-xs text-muted-foreground">Product tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServiceTags}</div>
            <p className="text-xs text-muted-foreground">Service tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjectTags}</div>
            <p className="text-xs text-muted-foreground">Project tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Quaternary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFAQs}</div>
            <p className="text-xs text-muted-foreground">Help articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllInquiries}</div>
            <p className="text-xs text-muted-foreground">Total inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="mt-2 text-gray-600">Access different management areas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">
                            {item.count} total{'active' in item ? `, ${item.active} active` : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Services by Category</CardTitle>
            <CardDescription>Distribution of services across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inquiry Status</CardTitle>
            <CardDescription>Current status of contact inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inquiryStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>Latest contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inquiries.slice(-5).reverse().map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{inquiry.name}</h4>
                    <Badge variant={inquiry.status === 'new' ? 'default' : inquiry.status === 'read' ? 'secondary' : 'outline'}>
                      {inquiry.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{inquiry.subject}</p>
                  <p className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-gray-500 text-center py-4">No inquiries yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}