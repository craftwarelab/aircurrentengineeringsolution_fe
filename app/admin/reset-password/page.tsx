'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

type State = 'idle' | 'loading' | 'success' | 'error';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect to login after a brief success pause
  useEffect(() => {
    if (state === 'success') {
      const timer = setTimeout(() => router.push('/admin/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  // No token in URL — show invalid link message immediately
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-2xl font-bold">✕</span>
        </div>
        <p className="font-semibold text-gray-800">Invalid or Expired Link</p>
        <p className="text-sm text-gray-500">
          This password reset link is missing a token. Please request a new one.
        </p>
        <Link href="/admin/forgot-password" className="w-full">
          <Button className="w-full">Request New Reset Link</Button>
        </Link>
        <Link href="/admin/login" className="w-full">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setState('error');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setState('success');
      } else {
        // API returns 400 for expired/invalid token or missing fields
        setErrorMsg(data.message || 'Password reset failed. Please try again.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setState('error');
    }
  };

  // ── Success state ──
  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <p className="font-semibold text-gray-800">Password Reset Successful!</p>
        <p className="text-sm text-gray-500">
          Your password has been updated. You'll be redirected to the login page in a moment.
        </p>
        <Link href="/admin/login" className="w-full">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    );
  }

  // ── Form state ──
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setState('idle'); }}
            placeholder="Min. 8 characters"
            disabled={state === 'loading'}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setState('idle'); }}
            placeholder="Re-enter your password"
            disabled={state === 'loading'}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {state === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMsg}
            {/* If the token is expired, offer a re-request link */}
            {errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid') ? (
              <span className="block mt-1">
                <Link href="/admin/forgot-password" className="underline font-medium">
                  Request a new reset link →
                </Link>
              </span>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={state === 'loading' || !newPassword.trim() || !confirmPassword.trim()}
      >
        {state === 'loading' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {state === 'loading' ? 'Resetting...' : 'Reset Password'}
      </Button>

      <Link href="/admin/login">
        <Button variant="ghost" className="w-full mt-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* useSearchParams requires Suspense boundary */}
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
