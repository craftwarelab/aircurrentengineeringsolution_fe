export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  details?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  specifications?: Record<string, string>;
  image?: string;
  price?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  industry: string;
  client: string;
  completionDate: string;
  image?: string;
  results?: string[];
  scope?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}
