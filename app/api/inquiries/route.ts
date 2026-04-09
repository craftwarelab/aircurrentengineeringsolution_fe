import { NextRequest, NextResponse } from 'next/server';
import { addContactInquiry } from '@/lib/mockDatabase';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, company, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Add to mock database
    const inquiry = addContactInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      company: company?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });

    // In a real application, you would:
    // 1. Send an email to the company
    // 2. Store in a real database
    // 3. Possibly integrate with CRM

    console.log('[v0] New contact inquiry received:', {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject,
      timestamp: inquiry.createdAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error processing inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all inquiries (for future admin panel)
export async function GET(request: NextRequest) {
  // In a real application, you would:
  // 1. Check authentication
  // 2. Return paginated results
  // 3. Filter by status, date range, etc.

  const { searchParams } = new URL(request.url);
  const authToken = searchParams.get('auth');

  // Simple auth check for demo
  if (authToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // In a real app, fetch from database
  // For now, return empty array
  return NextResponse.json(
    { inquiries: [] },
    { status: 200 }
  );
}
