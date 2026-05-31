'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Mail, Phone } from 'lucide-react';
import { getContactInquiries, updateInquiryStatus, type ContactInquiry } from '@/lib/mockDatabase';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  new: 'default',
  read: 'secondary',
  replied: 'outline',
} as const;

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInquiries(getContactInquiries());
  }, []);

  const handleStatusChange = (inquiryId: string, newStatus: ContactInquiry['status']) => {
    const updated = updateInquiryStatus(inquiryId, newStatus);
    if (updated) {
      setInquiries(inquiries.map(i => i.id === inquiryId ? updated : i));
      toast({
        title: 'Success',
        description: `Inquiry marked as ${newStatus}`,
      });
    }
  };

  const viewInquiry = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);
    // Mark as read if it's new
    if (inquiry.status === 'new') {
      handleStatusChange(inquiry.id, 'read');
    }
  };

  const getStatusBadge = (status: ContactInquiry['status']) => {
    return (
      <Badge variant={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
        <p className="mt-2 text-gray-600">Manage customer inquiries and communications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
          <CardDescription>View and manage all contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{inquiry.subject}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {inquiry.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value: ContactInquiry['status']) => handleStatusChange(inquiry.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewInquiry(inquiry)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Inquiry Details</DialogTitle>
                          <DialogDescription>
                            Contact information and message from {selectedInquiry?.name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedInquiry && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm text-gray-600">{selectedInquiry.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                              </div>
                              {selectedInquiry.phone && (
                                <div>
                                  <Label className="text-sm font-medium">Phone</Label>
                                  <p className="text-sm text-gray-600">{selectedInquiry.phone}</p>
                                </div>
                              )}
                              {selectedInquiry.company && (
                                <div>
                                  <Label className="text-sm font-medium">Company</Label>
                                  <p className="text-sm text-gray-600">{selectedInquiry.company}</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm font-medium">Date</Label>
                                <p className="text-sm text-gray-600">
                                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Subject</Label>
                              <p className="text-sm text-gray-600 font-medium">{selectedInquiry.subject}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Message</Label>
                              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {inquiries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No inquiries yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}