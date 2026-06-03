'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Clock, Users, Award, Phone, Mail, MapPin, X, ChevronsUpDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { CreateInquiryRequest } from '@/lib/hooks/use-inquiries';
import { useActiveServices } from '@/lib/hooks/use-services';

const BUDGET_RANGES = [
  'Under $50,000',
  '$50,000 – $150,000',
  '$150,000 – $500,000',
  '$500,000+',
  'Not sure yet',
];

function ServiceCombobox({
  services,
  selected,
  onAdd,
}: {
  services: { id: number; name: string }[];
  selected: string[];
  onAdd: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = services.filter(
    (s) => s.name.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s.name)
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-border rounded-lg px-4 py-2.5 bg-background text-sm hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
      >
        <span className="text-muted-foreground">Search and add a service...</span>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter services..."
              className="h-8 text-sm"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                {services.length === 0 ? 'Loading services...' : 'No more services to add'}
              </li>
            ) : (
              filtered.map((s) => (
                <li
                  key={s.id}
                  onClick={() => { onAdd(s.name); setQuery(''); setOpen(false); }}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-accent/10 transition-colors"
                >
                  {s.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

type DialogState = 'confirm' | 'submitting' | 'success' | 'error';

const EMPTY_FORM: CreateInquiryRequest = {
  full_name: '', email: '', phone_number: '', company_name: '',
  project_location: '', expected_timeline: '', estimated_budget: '',
  service_types: [], project_description: '',
};

export default function InquiriesPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreateInquiryRequest>(EMPTY_FORM);
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: rawServices } = useActiveServices();
  const activeServices = Array.isArray(rawServices) ? rawServices : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addService = (name: string) => {
    if (!formData.service_types.includes(name)) {
      setFormData((prev) => ({ ...prev, service_types: [...prev.service_types, name] }));
    }
  };

  const removeService = (name: string) => {
    setFormData((prev) => ({ ...prev, service_types: prev.service_types.filter((s) => s !== name) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.service_types.length === 0) {
      toast({ title: 'Please select at least one service', variant: 'destructive' });
      return;
    }
    setDialogState('confirm');
  };

  const confirmSubmit = async () => {
    setDialogState('submitting');
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit');
      setDialogState('success');
      setFormData(EMPTY_FORM);
    } catch (error: any) {
      setErrorMsg(error.message || 'Please try again or contact us directly.');
      setDialogState('error');
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
            Let's Build Something<br />Extraordinary Together
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="+94 70 123 4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company / Organization</label>
                    <Input name="company_name" value={formData.company_name || ''} onChange={handleChange} placeholder="Your Company" />
                  </div>
                </div>

                {/* Service Combobox */}
                <div>
                  <label className="block text-sm font-medium mb-2">Services Required *</label>
                  <ServiceCombobox
                    services={activeServices}
                    selected={formData.service_types}
                    onAdd={addService}
                  />
                  {formData.service_types.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.service_types.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1 pr-1 text-sm">
                          {s}
                          <button
                            type="button"
                            onClick={() => removeService(s)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Location *</label>
                    <Input name="project_location" value={formData.project_location} onChange={handleChange} required placeholder="Colombo, Sri Lanka" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Timeline</label>
                    <Input name="expected_timeline" value={formData.expected_timeline || ''} onChange={handleChange} placeholder="Q3 2026" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Budget</label>
                  <select
                    name="estimated_budget"
                    value={formData.estimated_budget || ''}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select budget range</option>
                    {BUDGET_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Description / Requirements *</label>
                  <Textarea
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Please describe your project requirements, challenges, or any specific needs..."
                    className="resize-y min-h-[140px]"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base"
                >
                  Submit Inquiry
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
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

      {/* Submission Dialog — single dialog, 4 states */}
      <Dialog
        open={dialogState !== null}
        onOpenChange={(open) => { if (!open && dialogState !== 'submitting') setDialogState(null); }}
      >
        <DialogContent showCloseButton={dialogState !== 'submitting'} className="sm:max-w-md">

          {dialogState === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit this inquiry? Our team will contact you within 24 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm space-y-1.5 rounded-lg border bg-muted/40 px-4 py-3">
                <p><span className="font-medium">Name:</span> {formData.full_name}</p>
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                <p><span className="font-medium">Services:</span> {formData.service_types.join(', ')}</p>
                <p><span className="font-medium">Location:</span> {formData.project_location}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogState(null)}>Go Back</Button>
                <Button onClick={confirmSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Yes, Submit
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogState === 'submitting' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-14 h-14 animate-spin text-accent" />
              <DialogTitle>Submitting Your Inquiry...</DialogTitle>
              <DialogDescription>Please wait while we process your request.</DialogDescription>
            </div>
          )}

          {dialogState === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <DialogTitle>Inquiry Submitted!</DialogTitle>
              <DialogDescription>
                Thank you! We've received your inquiry and will get back to you within 24 hours.
              </DialogDescription>
              <Button onClick={() => setDialogState(null)} className="mt-2 w-full">
                Done
              </Button>
            </div>
          )}

          {dialogState === 'error' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <XCircle className="w-16 h-16 text-destructive" />
              <DialogTitle>Submission Failed</DialogTitle>
              <DialogDescription>{errorMsg}</DialogDescription>
              <DialogFooter className="w-full">
                <Button variant="outline" onClick={() => setDialogState(null)}>Cancel</Button>
                <Button onClick={confirmSubmit}>Try Again</Button>
              </DialogFooter>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}
