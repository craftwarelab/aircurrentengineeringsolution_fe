'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Upload,
  Phone,
  Mail,
  MapPin 
} from 'lucide-react';

export default function InquiriesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    location: '',
    budget: '',
    timeline: '',
    message: '',
  });

  const serviceTypes = [
    'HVAC System Design',
    'Installation & Commissioning',
    'Maintenance & Service',
    'Energy Optimization',
    'Ventilation Systems',
    'Controls & Automation',
    'Consultation',
    'Other',
  ];

  const budgetRanges = [
    'Under $50,000',
    '$50,000 – $150,000',
    '$150,000 – $500,000',
    '$500,000+',
    'Not sure yet',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast({
        title: 'Inquiry Submitted Successfully',
        description: "We'll review your request and contact you within 24 hours.",
      });

      setFormData({
        name: '', email: '', phone: '', company: '',
        serviceType: '', location: '', budget: '', timeline: '', message: '',
      });
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1 bg-accent/20 rounded-full text-accent text-sm font-medium mb-6">
            Start Your Project
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Let’s Build Something<br />Extraordinary Together
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
            Submit your inquiry and our engineering team will get back to you within 24 hours with a tailored solution.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" /> 24h Response
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Users className="w-4 h-4" /> Dedicated Engineer
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Award className="w-4 h-4" /> Free Consultation
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Submit Your Inquiry</h2>
                <p className="text-muted-foreground">Fill out the form below. All fields marked with * are required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} required placeholder="+94 70 123 4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company / Organization</label>
                    <Input name="company" value={formData.company} onChange={handleChange} placeholder="Your Company" />
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <label className="block text-sm font-medium mb-2">Service Type *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                    className="w-full border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select a service</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Location *</label>
                    <Input name="location" value={formData.location} onChange={handleChange} required placeholder="Colombo, Sri Lanka" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Timeline</label>
                    <Input name="timeline" value={formData.timeline} onChange={handleChange} placeholder="Q3 2026" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Budget</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Description / Requirements *</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Please describe your project requirements, challenges, or any specific needs..."
                    className="resize-y min-h-[140px]"
                  />
                </div>

                {/* File Upload (UI only) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Attach Documents (Optional)</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer">
                    <Upload className="mx-auto w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DWG, JPG up to 25MB</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base"
                >
                  {isLoading ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Right Sidebar Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="font-semibold text-xl mb-6">What Happens Next?</h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Review', desc: 'Our team reviews your inquiry within 24 hours' },
                  { step: '02', title: 'Consultation', desc: 'We schedule a call to understand your needs better' },
                  { step: '03', title: 'Proposal', desc: 'You receive a detailed technical proposal & quote' },
                  { step: '04', title: 'Kickoff', desc: 'Project starts with a dedicated project manager' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary text-primary-foreground rounded-2xl p-8">
              <h3 className="font-semibold text-xl mb-6">Need Immediate Assistance?</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <a href="tel:+94701533195" className="hover:underline">+94 70 153 3195</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <a href="mailto:info@aircurrentengineeringsolution.com" className="hover:underline">info@aircurrentengineeringsolution.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span>Colombo 7, Sri Lanka</span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/admin/login" className="text-accent hover:underline">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
