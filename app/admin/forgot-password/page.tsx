'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';

type State = 'idle' | 'loading' | 'sent' | 'error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Always show the neutral success message — API returns 200 even if
        // the email is not registered (prevents email enumeration).
        setState('sent');
      } else {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ── Sent state ── */}
          {state === 'sent' ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <MailCheck className="h-14 w-14 text-green-500" />
              <p className="text-sm text-gray-700 leading-relaxed">
                If that email is registered, you will receive a password reset link shortly.
                Please also check your spam folder.
              </p>
              <div className="flex flex-col gap-2 w-full pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setState('idle'); setEmail(''); }}
                >
                  Send another link
                </Button>
                <Link href="/admin/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="admin@example.com"
                  disabled={state === 'loading'}
                  required
                />
              </div>

              {state === 'error' && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={state === 'loading' || !email.trim()}
              >
                {state === 'loading' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {state === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Link href="/admin/login">
                <Button variant="ghost" className="w-full mt-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
