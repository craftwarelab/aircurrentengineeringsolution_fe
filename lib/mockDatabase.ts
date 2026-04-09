import { Service, Product, Project, ContactInquiry } from '@/types';

// In-memory storage
let contactInquiries: ContactInquiry[] = [];
let inquiryIdCounter = 1;

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'HVAC System Design',
    description: 'Custom-engineered HVAC systems for optimal comfort and efficiency',
    category: 'Design',
    details: 'Our expert engineers design tailored HVAC systems using the latest CAD technology and industry standards. We consider building layout, occupancy patterns, and specific requirements to deliver efficient, cost-effective solutions.',
  },
  {
    id: '2',
    name: 'Ventilation Solutions',
    description: 'Advanced ventilation systems for air quality and contamination control',
    category: 'Ventilation',
    details: 'We specialize in designing advanced ventilation systems that maintain optimal indoor air quality. Our solutions include energy recovery ventilators, makeup air units, and custom duct design.',
  },
  {
    id: '3',
    name: 'Installation & Commissioning',
    description: 'Professional installation with full system commissioning and testing',
    category: 'Installation',
    details: 'Our certified technicians handle complete system installation from design through commissioning. We perform rigorous testing to ensure optimal performance and compliance with all regulations.',
  },
  {
    id: '4',
    name: 'Maintenance & Service',
    description: 'Preventive maintenance programs to keep systems running smoothly',
    category: 'Maintenance',
    details: 'Our preventive maintenance programs extend system lifespan and reduce unexpected breakdowns. We offer flexible service agreements tailored to your facility needs.',
  },
  {
    id: '5',
    name: 'Energy Audits',
    description: 'Comprehensive energy audits to identify savings opportunities',
    category: 'Consulting',
    details: 'We conduct thorough energy audits to identify inefficiencies and recommend upgrades. Our analysis helps reduce operating costs while improving system performance.',
  },
  {
    id: '6',
    name: 'Indoor Air Quality Assessment',
    description: 'Expert assessment and improvement of indoor air quality systems',
    category: 'Consulting',
    details: 'We assess your facility\'s indoor air quality and recommend improvements. Services include CO2 monitoring, filtration upgrades, and humidity control solutions.',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'XL-Series Commercial Unit',
    description: 'High-efficiency rooftop unit for large commercial buildings',
    type: 'HVAC Unit',
    specifications: {
      'Capacity': '15-60 tons',
      'Efficiency': 'SEER2 16+',
      'Voltage': '460V 3-phase',
      'Noise Level': '78-82 dB',
    },
    price: 'Custom quote',
  },
  {
    id: '2',
    name: 'EcoRecovery ERV',
    description: 'Energy recovery ventilator for superior efficiency',
    type: 'Ventilation',
    specifications: {
      'Air Flow': '500-2000 CFM',
      'Recovery Rate': '75-85%',
      'Sound Rating': 'NC 30',
      'Installation': 'In-line ductwork',
    },
    price: 'Custom quote',
  },
  {
    id: '3',
    name: 'SmartControl BMS',
    description: 'Integrated building management system with IoT capabilities',
    type: 'Controls',
    specifications: {
      'Platform': 'Cloud-based',
      'Devices': 'Unlimited',
      'Analytics': 'Real-time & historical',
      'Integration': 'BACnet, Modbus, REST API',
    },
    price: 'Custom quote',
  },
  {
    id: '4',
    name: 'Industrial Exhaust System',
    description: 'Heavy-duty exhaust system for industrial applications',
    type: 'Exhaust',
    specifications: {
      'Materials': 'Stainless steel',
      'Volume': '5000-25000 CFM',
      'Temperature': 'Up to 400°F',
      'Filtration': 'Multi-stage available',
    },
    price: 'Custom quote',
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Modern Office Complex - Climate Control Upgrade',
    description: 'Complete HVAC system redesign and upgrade for a 150,000 sq ft modern office complex',
    industry: 'Commercial Real Estate',
    client: 'Downtown Properties LLC',
    completionDate: '2024-03-15',
    scope: 'System design, equipment specification, installation, and commissioning',
    results: [
      '35% reduction in energy consumption',
      'Improved employee comfort and productivity',
      'LEED Gold certification achieved',
      'ROI within 4 years',
    ],
  },
  {
    id: '2',
    title: 'Hospital Ventilation System Overhaul',
    description: 'Advanced ventilation system upgrade to meet healthcare standards and improve air quality',
    industry: 'Healthcare',
    client: 'Metropolitan Hospital System',
    completionDate: '2024-02-20',
    scope: 'Ductwork design, UV sterilization installation, filter media upgrades',
    results: [
      'Exceeded air quality standards by 40%',
      '99.99% contamination removal',
      'Zero impact on facility operations',
      'Full compliance with healthcare regulations',
    ],
  },
  {
    id: '3',
    title: 'Manufacturing Facility Exhaust Upgrade',
    description: 'Industrial exhaust system installation with advanced filtration for hazardous materials',
    industry: 'Manufacturing',
    client: 'TechFab Industries',
    completionDate: '2024-01-10',
    scope: 'System design, component selection, installation, regulatory compliance',
    results: [
      'Emissions reduced by 60%',
      'Worker safety compliance achieved',
      'Equipment lifespan extended by 5 years',
      'Environmental permit obtained',
    ],
  },
  {
    id: '4',
    title: 'Educational Institution Climate Control',
    description: 'Campus-wide HVAC optimization for improved learning environment',
    industry: 'Education',
    client: 'Central University',
    completionDate: '2023-12-01',
    scope: 'Zoning redesign, control system upgrade, energy monitoring installation',
    results: [
      '28% energy savings',
      'Individual room temperature control',
      'Real-time energy dashboards',
      '$2.1M annual operational savings',
    ],
  },
];

export function getServices(): Service[] {
  return mockServices;
}

export function getProducts(): Product[] {
  return mockProducts;
}

export function getProjects(): Project[] {
  return mockProjects;
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
