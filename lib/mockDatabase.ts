import {
  User,
  ProductCategory,
  ProductSubcategory,
  ProductTag,
  Product,
  ProductImage,
  ProductStock,
  Service,
  ServiceCategory,
  ServiceSubcategory,
  ServiceTag,
  ServiceImage,
  Project,
  ProjectTag,
  ProjectImage,
  CustomerShowcase,
  Testimonial,
  FAQ,
  Inquiry,
  ContactInquiry
} from '@/types';

// Re-export types for convenience
export type {
  User,
  ProductCategory,
  ProductSubcategory,
  ProductTag,
  Product,
  ProductImage,
  ProductStock,
  Service,
  ServiceCategory,
  ServiceSubcategory,
  ServiceTag,
  ServiceImage,
  Project,
  ProjectTag,
  ProjectImage,
  CustomerShowcase,
  Testimonial,
  FAQ,
  Inquiry,
  ContactInquiry
} from '@/types';

// In-memory storage
let contactInquiries: ContactInquiry[] = [];
let inquiryIdCounter = 1;

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    address_line_1: '123 Main St',
    address_line_2: 'Apt 4B',
    mobile_number: '+1234567890',
    country: 'USA',
    email: 'john.doe@example.com',
    role: 'superAdmin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    address_line_1: '456 Oak Ave',
    mobile_number: '+1234567891',
    country: 'USA',
    email: 'jane.smith@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    first_name: 'Bob',
    last_name: 'Johnson',
    address_line_1: '789 Pine St',
    mobile_number: '+1234567892',
    country: 'Canada',
    email: 'bob.johnson@example.com',
    role: 'manager',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

// Mock Product Categories and Subcategories
export const mockProductCategories: ProductCategory[] = [
  {
    id: '1',
    name: 'HVAC Units',
    slug: 'hvac-units',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ventilation Systems',
    slug: 'ventilation-systems',
    position: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Controls & Automation',
    slug: 'controls-automation',
    position: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockProductSubcategories: ProductSubcategory[] = [
  {
    id: '1',
    category_id: '1',
    name: 'Rooftop Units',
    slug: 'rooftop-units',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    category_id: '1',
    name: 'Split Systems',
    slug: 'split-systems',
    position: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    category_id: '2',
    name: 'Energy Recovery Ventilators',
    slug: 'energy-recovery-ventilators',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Product Tags
export const mockProductTags: ProductTag[] = [
  {
    id: '1',
    name: 'Energy Efficient',
    slug: 'energy-efficient',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Commercial',
    slug: 'commercial',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Industrial',
    slug: 'industrial',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Smart Controls',
    slug: 'smart-controls',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Service Categories and Subcategories
export const mockServiceCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Design & Engineering',
    slug: 'design-engineering',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Installation',
    slug: 'installation',
    position: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Maintenance',
    slug: 'maintenance',
    position: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockServiceSubcategories: ServiceSubcategory[] = [
  {
    id: '1',
    category_id: '1',
    name: 'HVAC Design',
    slug: 'hvac-design',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    category_id: '2',
    name: 'System Installation',
    slug: 'system-installation',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Service Tags
export const mockServiceTags: ServiceTag[] = [
  {
    id: '1',
    name: '24/7 Support',
    slug: '24-7-support',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Certified Technicians',
    slug: 'certified-technicians',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Project Tags
export const mockProjectTags: ProjectTag[] = [
  {
    id: '1',
    name: 'Healthcare',
    slug: 'healthcare',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Commercial',
    slug: 'commercial',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Educational',
    slug: 'educational',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Customer Showcases
export const mockCustomerShowcases: CustomerShowcase[] = [
  {
    id: '1',
    company_name: 'TechCorp Industries',
    logo_url: '/logos/techcorp.png',
    customer_name: 'Sarah Johnson',
    customer_position: 'Facilities Manager',
    description: 'Outstanding HVAC upgrade that reduced our energy costs by 35% while improving indoor air quality significantly.',
    slug: 'techcorp-industries',
    position: 1,
    is_active: true,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    company_name: 'Metro Hospital',
    logo_url: '/logos/metro-hospital.png',
    customer_name: 'Dr. Michael Chen',
    customer_position: 'Chief of Operations',
    description: 'Professional installation and commissioning of our new ventilation system. Zero downtime during the upgrade.',
    slug: 'metro-hospital',
    position: 2,
    is_active: true,
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

// Mock Testimonials
export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    message: 'The team delivered exceptional service from design to installation. Our new HVAC system has improved comfort and reduced costs.',
    customer_name: 'Robert Wilson',
    customer_position: 'Building Manager',
    company_name: 'Wilson Properties',
    is_approved: true,
    is_active: true,
    position: 1,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    message: 'Outstanding maintenance service. They are reliable, knowledgeable, and always responsive to our needs.',
    customer_name: 'Lisa Martinez',
    customer_position: 'Operations Director',
    company_name: 'Manufacturing Plus',
    is_approved: true,
    is_active: true,
    position: 2,
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

// Mock FAQs
export const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How often should HVAC systems be serviced?',
    answer: 'We recommend quarterly maintenance for most commercial HVAC systems to ensure optimal performance, energy efficiency, and to prevent costly breakdowns.',
    priority: 1,
    is_active: true,
    status: 'active',
    slug: 'hvac-service-frequency',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    question: 'What certifications do your technicians hold?',
    answer: 'Our technicians are certified by NATE (North American Technician Excellence), EPA certified for refrigerant handling, and hold OSHA safety certifications.',
    priority: 2,
    is_active: true,
    status: 'active',
    slug: 'technician-certifications',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Inquiries
export const mockInquiries: Inquiry[] = [
  {
    id: '1',
    name: 'Alice Cooper',
    email: 'alice.cooper@business.com',
    phone: '+1234567893',
    company: 'Cooper Enterprises',
    subject: 'Commercial HVAC Installation',
    message: 'We are looking to upgrade our office building\'s HVAC system. Can you provide a quote for a complete installation?',
    status: 'new',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    name: 'David Brown',
    email: 'd.brown@school.edu',
    phone: '+1234567894',
    company: 'City School District',
    subject: 'School Ventilation Assessment',
    message: 'We need an assessment of our school\'s ventilation system to ensure it meets current air quality standards.',
    status: 'pending',
    handled_by: '2',
    created_at: '2024-01-09T00:00:00Z',
    updated_at: '2024-01-09T00:00:00Z',
  },
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'HVAC System Design',
    slug: 'hvac-system-design',
    code: 'HSD-001',
    price: 5000,
    description: 'Custom-engineered HVAC systems for optimal comfort and efficiency using latest CAD technology and industry standards.',
    short_description: 'Custom-engineered HVAC systems for optimal comfort and efficiency',
    status: 'active',
    is_featured: true,
    seo_title: 'HVAC System Design - Custom Engineering Solutions',
    seo_description: 'Professional HVAC system design with CAD technology for optimal performance and efficiency.',
    meta_keywords: 'HVAC design, custom engineering, CAD, system design',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ventilation Solutions',
    slug: 'ventilation-solutions',
    code: 'VS-002',
    price: 3500,
    description: 'Advanced ventilation systems for air quality and contamination control with energy recovery ventilators.',
    short_description: 'Advanced ventilation systems for air quality and contamination control',
    status: 'active',
    is_featured: false,
    seo_title: 'Ventilation Solutions - Advanced Air Quality Systems',
    seo_description: 'Advanced ventilation systems including ERVs, makeup air units, and custom duct design.',
    meta_keywords: 'ventilation, air quality, ERV, contamination control',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Installation & Commissioning',
    slug: 'installation-commissioning',
    code: 'IC-003',
    price: 8000,
    description: 'Professional installation with full system commissioning and testing by certified technicians.',
    short_description: 'Professional installation with full system commissioning and testing',
    status: 'active',
    is_featured: true,
    seo_title: 'HVAC Installation & Commissioning - Professional Service',
    seo_description: 'Complete HVAC system installation and commissioning with rigorous testing and compliance.',
    meta_keywords: 'HVAC installation, commissioning, testing, certified technicians',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Maintenance & Service',
    slug: 'maintenance-service',
    code: 'MS-004',
    price: 1200,
    description: 'Preventive maintenance programs to keep systems running smoothly with flexible service agreements.',
    short_description: 'Preventive maintenance programs to keep systems running smoothly',
    status: 'active',
    is_featured: false,
    seo_title: 'HVAC Maintenance & Service - Preventive Programs',
    seo_description: 'Comprehensive preventive maintenance programs to extend system life and reduce breakdowns.',
    meta_keywords: 'HVAC maintenance, preventive maintenance, service agreements',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    name: 'Energy Audits',
    slug: 'energy-audits',
    code: 'EA-005',
    price: 2500,
    description: 'Comprehensive energy audits to identify savings opportunities and recommend efficiency upgrades.',
    short_description: 'Comprehensive energy audits to identify savings opportunities',
    status: 'active',
    is_featured: false,
    seo_title: 'Energy Audits - Efficiency Analysis & Savings',
    seo_description: 'Detailed energy audits to identify inefficiencies and recommend cost-saving upgrades.',
    meta_keywords: 'energy audit, efficiency, cost savings, analysis',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    name: 'Indoor Air Quality Assessment',
    slug: 'indoor-air-quality-assessment',
    code: 'IAQ-006',
    price: 1800,
    description: 'Expert assessment and improvement of indoor air quality systems with CO2 monitoring and filtration.',
    short_description: 'Expert assessment and improvement of indoor air quality systems',
    status: 'active',
    is_featured: false,
    seo_title: 'Indoor Air Quality Assessment - IAQ Testing & Solutions',
    seo_description: 'Comprehensive IAQ assessment including CO2 monitoring, filtration upgrades, and humidity control.',
    meta_keywords: 'indoor air quality, IAQ, assessment, CO2 monitoring',
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z',
  },
];

// Mock Service Images
export const mockServiceImages: ServiceImage[] = [
  {
    id: '1',
    service_id: '1',
    url: '/services/hvac-design-1.jpg',
    is_main: true,
    position: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'XL-Series Commercial Unit',
    slug: 'xl-series-commercial-unit',
    code: 'XL-1000',
    sku: 'XL1000-15T',
    model: 'XL-1000',
    price: 25000,
    sale_price: 22000,
    description: 'High-efficiency rooftop unit for large commercial buildings with advanced controls and energy recovery.',
    short_description: 'High-efficiency rooftop unit for large commercial buildings',
    status: 'active',
    is_featured: true,
    seo_title: 'XL-Series Commercial HVAC Unit - High Efficiency',
    seo_description: 'Professional-grade rooftop HVAC unit with SEER2 16+ efficiency rating.',
    meta_keywords: 'HVAC, rooftop unit, commercial, energy efficient',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'EcoRecovery ERV',
    slug: 'ecorecovery-erv',
    code: 'ERV-500',
    sku: 'ERV500-1000',
    model: 'ERV-500',
    price: 8500,
    description: 'Energy recovery ventilator for superior efficiency and indoor air quality',
    short_description: 'Energy recovery ventilator for superior efficiency',
    status: 'active',
    is_featured: false,
    seo_title: 'EcoRecovery ERV - Energy Recovery Ventilator',
    seo_description: 'Advanced ERV with 75-85% recovery rate for optimal ventilation efficiency.',
    meta_keywords: 'ERV, ventilation, energy recovery, indoor air quality',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'SmartControl BMS',
    slug: 'smartcontrol-bms',
    code: 'BMS-2000',
    sku: 'BMS2000-ENT',
    model: 'BMS-2000',
    price: 15000,
    description: 'Integrated building management system with IoT capabilities and real-time monitoring',
    short_description: 'Integrated building management system with IoT capabilities',
    status: 'active',
    is_featured: true,
    seo_title: 'SmartControl BMS - Building Management System',
    seo_description: 'Cloud-based BMS with unlimited devices and advanced analytics.',
    meta_keywords: 'BMS, building management, IoT, automation, controls',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Industrial Exhaust System',
    slug: 'industrial-exhaust-system',
    code: 'EXH-3000',
    sku: 'EXH3000-STL',
    model: 'EXH-3000',
    price: 35000,
    description: 'Heavy-duty exhaust system for industrial applications with stainless steel construction',
    short_description: 'Heavy-duty exhaust system for industrial applications',
    status: 'active',
    is_featured: false,
    seo_title: 'Industrial Exhaust System - Heavy Duty',
    seo_description: 'Stainless steel exhaust system rated for up to 400°F with multi-stage filtration.',
    meta_keywords: 'exhaust system, industrial, stainless steel, heavy duty',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
];

// Mock Product Images
export const mockProductImages: ProductImage[] = [
  {
    id: '1',
    product_id: '1',
    url: '/products/xl-series-1.jpg',
    is_main: true,
    position: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: '1',
    url: '/products/xl-series-2.jpg',
    is_main: false,
    position: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Product Stocks
export const mockProductStocks: ProductStock[] = [
  {
    id: '1',
    product_id: '1',
    quantity: 5,
    reserved_quantity: 1,
    warehouse_id: 1,
    low_stock_threshold: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Modern Office Complex - Climate Control Upgrade',
    slug: 'modern-office-complex-climate-control-upgrade',
    description: 'Complete HVAC system redesign and upgrade for a 150,000 sq ft modern office complex achieving LEED Gold certification.',
    seo_title: 'Office Complex HVAC Upgrade - 35% Energy Savings',
    seo_description: 'Complete climate control upgrade for modern office complex with significant energy savings and LEED certification.',
    meta_keywords: 'office HVAC, climate control, energy efficiency, LEED certification',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Hospital Ventilation System Overhaul',
    slug: 'hospital-ventilation-system-overhaul',
    description: 'Advanced ventilation system upgrade to meet healthcare standards and improve air quality with zero downtime.',
    seo_title: 'Hospital Ventilation Overhaul - Healthcare Standards',
    seo_description: 'Advanced ventilation upgrade exceeding air quality standards by 40% with zero operational impact.',
    meta_keywords: 'hospital ventilation, healthcare standards, air quality, UV sterilization',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Manufacturing Facility Exhaust Upgrade',
    slug: 'manufacturing-facility-exhaust-upgrade',
    description: 'Industrial exhaust system installation with advanced filtration for hazardous materials and regulatory compliance.',
    seo_title: 'Manufacturing Exhaust Upgrade - Hazardous Materials',
    seo_description: 'Industrial exhaust system reducing emissions by 60% with advanced filtration and safety compliance.',
    meta_keywords: 'industrial exhaust, hazardous materials, emissions reduction, regulatory compliance',
    status: 'active',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    title: 'Educational Institution Climate Control',
    slug: 'educational-institution-climate-control',
    description: 'Campus-wide HVAC optimization for improved learning environment with individual room temperature control.',
    seo_title: 'University HVAC Optimization - Climate Control',
    seo_description: 'Campus-wide climate control optimization achieving 28% energy savings and improved learning environment.',
    meta_keywords: 'university HVAC, campus climate control, energy savings, education',
    status: 'active',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
];

// Mock Project Images
export const mockProjectImages: ProjectImage[] = [
  {
    id: '1',
    project_id: '1',
    url: '/projects/office-complex-1.jpg',
    is_main: true,
    position: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    project_id: '2',
    url: '/projects/hospital-ventilation-1.jpg',
    is_main: true,
    position: 1,
    created_at: '2024-01-02T00:00:00Z',
  },
];

export function getServices(): Service[] {
  return [...mockServices];
}

export function addService(service: Omit<Service, 'id'>): Service {
  const newService: Service = {
    ...service,
    id: String(Date.now()),
  };
  mockServices.push(newService);
  return newService;
}

export function updateService(id: string, updates: Partial<Service>): Service | undefined {
  const serviceIndex = mockServices.findIndex(s => s.id === id);
  if (serviceIndex !== -1) {
    mockServices[serviceIndex] = { ...mockServices[serviceIndex], ...updates };
    return mockServices[serviceIndex];
  }
  return undefined;
}

export function deleteService(id: string): boolean {
  const serviceIndex = mockServices.findIndex(s => s.id === id);
  if (serviceIndex !== -1) {
    mockServices.splice(serviceIndex, 1);
    return true;
  }
  return false;
}

export function getProducts(): Product[] {
  return [...mockProducts];
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const newProduct: Product = {
    ...product,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockProducts.push(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | undefined {
  const productIndex = mockProducts.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...updates };
    return mockProducts[productIndex];
  }
  return undefined;
}

export function deleteProduct(id: string): boolean {
  const productIndex = mockProducts.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    mockProducts.splice(productIndex, 1);
    return true;
  }
  return false;
}

export function getProjects(): Project[] {
  return [...mockProjects];
}

export function addProject(project: Omit<Project, 'id'>): Project {
  const newProject: Project = {
    ...project,
    id: String(Date.now()),
  };
  mockProjects.push(newProject);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projectIndex = mockProjects.findIndex(p => p.id === id);
  if (projectIndex !== -1) {
    mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updates };
    return mockProjects[projectIndex];
  }
  return undefined;
}

export function deleteProject(id: string): boolean {
  const projectIndex = mockProjects.findIndex(p => p.id === id);
  if (projectIndex !== -1) {
    mockProjects.splice(projectIndex, 1);
    return true;
  }
  return false;
}

export function addContactInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): ContactInquiry {
  const newInquiry: ContactInquiry = {
    ...inquiry,
    id: String(inquiryIdCounter++),
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  contactInquiries.push(newInquiry);
  return newInquiry;
}

export function getContactInquiries(): ContactInquiry[] {
  return contactInquiries;
}

export function getContactInquiry(id: string): ContactInquiry | undefined {
  return contactInquiries.find((inquiry) => inquiry.id === id);
}

export function updateInquiryStatus(id: string, status: ContactInquiry['status']): ContactInquiry | undefined {
  const inquiry = contactInquiries.find((i) => i.id === id);
  if (inquiry) {
    inquiry.status = status;
  }
  return inquiry;
}

// User functions
export function getUsers(): User[] {
  return [...mockUsers];
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
  const newUser: User = {
    ...user,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updated_at: new Date().toISOString() };
    return mockUsers[userIndex];
  }
  return undefined;
}

export function deleteUser(id: string): boolean {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    mockUsers.splice(userIndex, 1);
    return true;
  }
  return false;
}

// Product Category functions
export function getProductCategories(): ProductCategory[] {
  return [...mockProductCategories];
}

export function addProductCategory(category: Omit<ProductCategory, 'id' | 'created_at'>): ProductCategory {
  const newCategory: ProductCategory = {
    ...category,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockProductCategories.push(newCategory);
  return newCategory;
}

export function updateProductCategory(id: string, updates: Partial<ProductCategory>): ProductCategory | undefined {
  const categoryIndex = mockProductCategories.findIndex(c => c.id === id);
  if (categoryIndex !== -1) {
    mockProductCategories[categoryIndex] = { ...mockProductCategories[categoryIndex], ...updates };
    return mockProductCategories[categoryIndex];
  }
  return undefined;
}

export function deleteProductCategory(id: string): boolean {
  const categoryIndex = mockProductCategories.findIndex(c => c.id === id);
  if (categoryIndex !== -1) {
    mockProductCategories.splice(categoryIndex, 1);
    return true;
  }
  return false;
}

// Product Tag functions
export function getProductTags(): ProductTag[] {
  return [...mockProductTags];
}

export function addProductTag(tag: Omit<ProductTag, 'id' | 'created_at'>): ProductTag {
  const newTag: ProductTag = {
    ...tag,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockProductTags.push(newTag);
  return newTag;
}

export function updateProductTag(id: string, updates: Partial<ProductTag>): ProductTag | undefined {
  const tagIndex = mockProductTags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    mockProductTags[tagIndex] = { ...mockProductTags[tagIndex], ...updates };
    return mockProductTags[tagIndex];
  }
  return undefined;
}

export function deleteProductTag(id: string): boolean {
  const tagIndex = mockProductTags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    mockProductTags.splice(tagIndex, 1);
    return true;
  }
  return false;
}

// Service Category functions
export function getServiceCategories(): ServiceCategory[] {
  return [...mockServiceCategories];
}

export function addServiceCategory(category: Omit<ServiceCategory, 'id' | 'created_at'>): ServiceCategory {
  const newCategory: ServiceCategory = {
    ...category,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockServiceCategories.push(newCategory);
  return newCategory;
}

export function updateServiceCategory(id: string, updates: Partial<ServiceCategory>): ServiceCategory | undefined {
  const categoryIndex = mockServiceCategories.findIndex(c => c.id === id);
  if (categoryIndex !== -1) {
    mockServiceCategories[categoryIndex] = { ...mockServiceCategories[categoryIndex], ...updates };
    return mockServiceCategories[categoryIndex];
  }
  return undefined;
}

export function deleteServiceCategory(id: string): boolean {
  const categoryIndex = mockServiceCategories.findIndex(c => c.id === id);
  if (categoryIndex !== -1) {
    mockServiceCategories.splice(categoryIndex, 1);
    return true;
  }
  return false;
}

// Project Tag functions
export function getProjectTags(): ProjectTag[] {
  return [...mockProjectTags];
}

export function addProjectTag(tag: Omit<ProjectTag, 'id' | 'created_at'>): ProjectTag {
  const newTag: ProjectTag = {
    ...tag,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockProjectTags.push(newTag);
  return newTag;
}

export function updateProjectTag(id: string, updates: Partial<ProjectTag>): ProjectTag | undefined {
  const tagIndex = mockProjectTags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    mockProjectTags[tagIndex] = { ...mockProjectTags[tagIndex], ...updates };
    return mockProjectTags[tagIndex];
  }
  return undefined;
}

export function deleteProjectTag(id: string): boolean {
  const tagIndex = mockProjectTags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    mockProjectTags.splice(tagIndex, 1);
    return true;
  }
  return false;
}

// Product Subcategory functions
export function getProductSubcategories(): ProductSubcategory[] {
  return [...mockProductSubcategories];
}

export function addProductSubcategory(subcategory: Omit<ProductSubcategory, 'id' | 'created_at'>): ProductSubcategory {
  const newSubcategory: ProductSubcategory = {
    ...subcategory,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockProductSubcategories.push(newSubcategory);
  return newSubcategory;
}

export function updateProductSubcategory(id: string, updates: Partial<ProductSubcategory>): ProductSubcategory | undefined {
  const subcategoryIndex = mockProductSubcategories.findIndex(c => c.id === id);
  if (subcategoryIndex !== -1) {
    mockProductSubcategories[subcategoryIndex] = { ...mockProductSubcategories[subcategoryIndex], ...updates };
    return mockProductSubcategories[subcategoryIndex];
  }
  return undefined;
}

export function deleteProductSubcategory(id: string): boolean {
  const subcategoryIndex = mockProductSubcategories.findIndex(c => c.id === id);
  if (subcategoryIndex !== -1) {
    mockProductSubcategories.splice(subcategoryIndex, 1);
    return true;
  }
  return false;
}

// Service Subcategory functions
export function getServiceSubcategories(): ServiceSubcategory[] {
  return [...mockServiceSubcategories];
}

export function addServiceSubcategory(subcategory: Omit<ServiceSubcategory, 'id' | 'created_at'>): ServiceSubcategory {
  const newSubcategory: ServiceSubcategory = {
    ...subcategory,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockServiceSubcategories.push(newSubcategory);
  return newSubcategory;
}

export function updateServiceSubcategory(id: string, updates: Partial<ServiceSubcategory>): ServiceSubcategory | undefined {
  const subcategoryIndex = mockServiceSubcategories.findIndex(c => c.id === id);
  if (subcategoryIndex !== -1) {
    mockServiceSubcategories[subcategoryIndex] = { ...mockServiceSubcategories[subcategoryIndex], ...updates };
    return mockServiceSubcategories[subcategoryIndex];
  }
  return undefined;
}

export function deleteServiceSubcategory(id: string): boolean {
  const subcategoryIndex = mockServiceSubcategories.findIndex(c => c.id === id);
  if (subcategoryIndex !== -1) {
    mockServiceSubcategories.splice(subcategoryIndex, 1);
    return true;
  }
  return false;
}

// Customer Showcase functions
export function getCustomerShowcases(): CustomerShowcase[] {
  return [...mockCustomerShowcases];
}

export function addCustomerShowcase(showcase: Omit<CustomerShowcase, 'id' | 'created_at' | 'updated_at'>): CustomerShowcase {
  const newShowcase: CustomerShowcase = {
    ...showcase,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockCustomerShowcases.push(newShowcase);
  return newShowcase;
}

export function updateCustomerShowcase(id: string, updates: Partial<CustomerShowcase>): CustomerShowcase | undefined {
  const showcaseIndex = mockCustomerShowcases.findIndex(s => s.id === id);
  if (showcaseIndex !== -1) {
    mockCustomerShowcases[showcaseIndex] = { ...mockCustomerShowcases[showcaseIndex], ...updates, updated_at: new Date().toISOString() };
    return mockCustomerShowcases[showcaseIndex];
  }
  return undefined;
}

export function deleteCustomerShowcase(id: string): boolean {
  const showcaseIndex = mockCustomerShowcases.findIndex(s => s.id === id);
  if (showcaseIndex !== -1) {
    mockCustomerShowcases.splice(showcaseIndex, 1);
    return true;
  }
  return false;
}

// Service Tag functions
export function getServiceTags(): ServiceTag[] {
  return [...mockServiceTags];
}

export function addServiceTag(tag: Omit<ServiceTag, 'id' | 'created_at'>): ServiceTag {
  const newTag: ServiceTag = {
    ...tag,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  mockServiceTags.push(newTag);
  return newTag;
}

export function updateServiceTag(id: string, updates: Partial<ServiceTag>): ServiceTag | undefined {
  const tagIndex = mockServiceTags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    mockServiceTags[tagIndex] = { ...mockServiceTags[tagIndex], ...updates };
    return mockServiceTags[tagIndex];
  }
  return undefined;
}

export function deleteServiceTag(id: string): boolean {
  const tagIndex = mockServiceTags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    mockServiceTags.splice(tagIndex, 1);
    return true;
  }
  return false;
}

// Testimonial functions
export function getTestimonials(): Testimonial[] {
  return [...mockTestimonials];
}

export function addTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Testimonial {
  const newTestimonial: Testimonial = {
    ...testimonial,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockTestimonials.push(newTestimonial);
  return newTestimonial;
}

export function updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | undefined {
  const testimonialIndex = mockTestimonials.findIndex(t => t.id === id);
  if (testimonialIndex !== -1) {
    mockTestimonials[testimonialIndex] = { ...mockTestimonials[testimonialIndex], ...updates, updated_at: new Date().toISOString() };
    return mockTestimonials[testimonialIndex];
  }
  return undefined;
}

export function deleteTestimonial(id: string): boolean {
  const testimonialIndex = mockTestimonials.findIndex(t => t.id === id);
  if (testimonialIndex !== -1) {
    mockTestimonials.splice(testimonialIndex, 1);
    return true;
  }
  return false;
}

// FAQ functions
export function getFAQs(): FAQ[] {
  return [...mockFAQs];
}

export function addFAQ(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): FAQ {
  const newFAQ: FAQ = {
    ...faq,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockFAQs.push(newFAQ);
  return newFAQ;
}

export function updateFAQ(id: string, updates: Partial<FAQ>): FAQ | undefined {
  const faqIndex = mockFAQs.findIndex(f => f.id === id);
  if (faqIndex !== -1) {
    mockFAQs[faqIndex] = { ...mockFAQs[faqIndex], ...updates, updated_at: new Date().toISOString() };
    return mockFAQs[faqIndex];
  }
  return undefined;
}

export function deleteFAQ(id: string): boolean {
  const faqIndex = mockFAQs.findIndex(f => f.id === id);
  if (faqIndex !== -1) {
    mockFAQs.splice(faqIndex, 1);
    return true;
  }
  return false;
}

// Inquiry functions
export function getInquiries(): Inquiry[] {
  return [...mockInquiries];
}

export function getInquiryById(id: string): Inquiry | undefined {
  return mockInquiries.find(i => i.id === id);
}

export function addInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>): Inquiry {
  const newInquiry: Inquiry = {
    ...inquiry,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockInquiries.push(newInquiry);
  return newInquiry;
}

export function updateInquiry(id: string, updates: Partial<Inquiry>): Inquiry | undefined {
  const inquiryIndex = mockInquiries.findIndex(i => i.id === id);
  if (inquiryIndex !== -1) {
    mockInquiries[inquiryIndex] = { ...mockInquiries[inquiryIndex], ...updates, updated_at: new Date().toISOString() };
    return mockInquiries[inquiryIndex];
  }
  return undefined;
}

export function deleteInquiry(id: string): boolean {
  const inquiryIndex = mockInquiries.findIndex(i => i.id === id);
  if (inquiryIndex !== -1) {
    mockInquiries.splice(inquiryIndex, 1);
    return true;
  }
  return false;
}
