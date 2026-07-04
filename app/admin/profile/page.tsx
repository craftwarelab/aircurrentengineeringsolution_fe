'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PhoneInput } from '@/components/ui/phone-input';
import { AuthUtils } from '@/lib/auth';
import { toast } from 'sonner';
import {
  User, Lock, Mail, Save, Loader2, Eye, EyeOff,
  CheckCircle2, RefreshCw, ShieldCheck,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  address_line_1: string | null;
  address_line_2: string | null;
  mobile_number: string | null;
  country: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Helper — calls backend directly (NEXT_PUBLIC_API_URL is correctly
// embedded in the browser bundle; never read at module level to avoid
// the build-time baking issue with the localhost fallback) ───────────────────

async function profileFetch(method: string, path: string, body?: object) {
  const token = AuthUtils.getAccessToken();
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const res = await fetch(`${base}/profile${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── OTP Input — 6 individual digit boxes ────────────────────────────────────

function OtpInput({ value, onChange, disabled }: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = value.split('');
      if (next[idx]) {
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        next[idx - 1] = '';
        onChange(next.join(''));
        inputs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    // Handle paste — spread digits across boxes
    if (raw.length > 1) {
      const digits = raw.slice(0, 6).split('');
      const next = Array(6).fill('');
      digits.forEach((d, i) => { next[i] = d; });
      onChange(next.join(''));
      inputs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    const next = value.split('').concat(Array(6).fill('')).slice(0, 6);
    next[idx] = raw[0];
    onChange(next.join(''));
    if (idx < 5) inputs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKey(idx, e)}
          disabled={disabled}
          className="w-11 h-12 text-center text-lg font-semibold border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      ))}
    </div>
  );
}

// ─── OTP Countdown timer ──────────────────────────────────────────────────────

function OtpTimer({ startedAt, ttlSeconds, onExpire }: {
  startedAt: number;
  ttlSeconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(ttlSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    setRemaining(ttlSeconds);
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = ttlSeconds - elapsed;
      if (left <= 0) {
        setRemaining(0);
        clearInterval(id);
        if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
      } else {
        setRemaining(left);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, ttlSeconds, onExpire]);

  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  const isLow = remaining <= 60;

  return (
    <p className={`text-sm text-center ${isLow ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
      Code expires in {m}:{s}
    </p>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  // Profile data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '',
    address_line_1: '', address_line_2: '',
    mobile_number: '', country: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});

  // Email change — step 1
  const [newEmail, setNewEmail] = useState('');
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailOtpSentAt, setEmailOtpSentAt] = useState(0);
  const [emailOtpExpired, setEmailOtpExpired] = useState(false);

  // Password change — step 1
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [pwStep, setPwStep] = useState<1 | 2>(1);
  const [pwOtp, setPwOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwOtpSentAt, setPwOtpSentAt] = useState(0);
  const [pwOtpExpired, setPwOtpExpired] = useState(false);

  // ── Fetch profile ──────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError('');
    const { ok, data } = await profileFetch('GET', '/');
    setProfileLoading(false);
    if (ok && data.success) {
      const p: Profile = data.data;
      setProfile(p);
      setProfileForm({
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        address_line_1: p.address_line_1 || '',
        address_line_2: p.address_line_2 || '',
        mobile_number: p.mobile_number || '',
        country: p.country || '',
      });
    } else {
      setProfileError(data.message || 'Failed to load profile');
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Profile update ─────────────────────────────────────────────────────────

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileFieldErrors({});

    // Only send fields that actually have a value to avoid empty-body 400
    const body: Record<string, string> = {};
    (Object.keys(profileForm) as (keyof typeof profileForm)[]).forEach((k) => {
      if (profileForm[k] !== '') body[k] = profileForm[k];
    });

    if (Object.keys(body).length === 0) {
      toast.error('No changes to save');
      setProfileSaving(false);
      return;
    }

    const { ok, data } = await profileFetch('PATCH', '/', body);
    setProfileSaving(false);

    if (ok && data.success) {
      setProfile(data.data);
      // Keep AuthUtils in sync with updated name/email
      AuthUtils.updateUser(data.data);
      toast.success('Profile updated successfully');
    } else {
      // Map validation detail errors to field keys
      if (data.details?.length) {
        const fieldErrs: Record<string, string> = {};
        data.details.forEach((d: any) => {
          const key = d.context?.key || d.path?.[0];
          if (key) fieldErrs[key] = d.message?.replace(/['"]/g, '') || 'Invalid value';
        });
        setProfileFieldErrors(fieldErrs);
      }
      toast.error(data.message || 'Failed to update profile');
    }
  };

  // ── Email change — step 1 ──────────────────────────────────────────────────

  const handleEmailRequest = async (isResend = false) => {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    setEmailError('');
    const { ok, data } = await profileFetch('POST', '/email/request-change', { new_email: newEmail.trim() });
    setEmailLoading(false);
    if (ok && data.success) {
      setEmailOtpSentAt(Date.now());
      setEmailOtpExpired(false);
      setEmailOtp('');
      setEmailStep(2);
      toast.success(isResend ? 'New code sent to your new email' : 'Verification code sent to your new email');
    } else {
      setEmailError(data.message || 'Failed to send verification code');
    }
  };

  // ── Email change — step 2 ──────────────────────────────────────────────────

  const handleEmailVerify = async () => {
    if (emailOtp.replace(/\s/g, '').length < 6) return;
    setEmailLoading(true);
    setEmailError('');
    const { ok, data } = await profileFetch('POST', '/email/verify-change', { otp: emailOtp });
    setEmailLoading(false);
    if (ok && data.success) {
      setProfile((prev) => prev ? { ...prev, email: data.data.email } : prev);
      AuthUtils.updateUser({ email: data.data.email });
      toast.success('Email address updated successfully');
      // Reset flow
      setEmailStep(1);
      setNewEmail('');
      setEmailOtp('');
    } else {
      setEmailError(data.message || 'Verification failed');
      if (data.message?.toLowerCase().includes('expired')) {
        setEmailOtpExpired(true);
      }
    }
  };

  // ── Password change — step 1 ───────────────────────────────────────────────

  const handlePwRequest = async (isResend = false) => {
    if (!currentPassword.trim()) return;
    setPwLoading(true);
    setPwError('');
    const { ok, data } = await profileFetch('POST', '/password/request-change', { current_password: currentPassword });
    setPwLoading(false);
    if (ok && data.success) {
      setPwOtpSentAt(Date.now());
      setPwOtpExpired(false);
      setPwOtp('');
      setPwStep(2);
      toast.success(isResend ? 'New code sent to your email' : 'Verification code sent to your email');
    } else {
      setPwError(data.message || 'Failed to send verification code');
    }
  };

  // ── Password change — step 2 ───────────────────────────────────────────────

  const handlePwVerify = async () => {
    if (pwOtp.replace(/\s/g, '').length < 6) return;
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    setPwError('');
    const { ok, data } = await profileFetch('POST', '/password/verify-change', {
      otp: pwOtp,
      new_password: newPassword,
    });
    setPwLoading(false);
    if (ok && data.success) {
      toast.success('Password changed successfully. Please log in again.');
      // Backend keeps session alive but recommends re-login — we force it for security
      setTimeout(() => {
        AuthUtils.logout();
        window.dispatchEvent(new CustomEvent('authChange'));
        router.push('/admin/login');
      }, 1500);
    } else {
      setPwError(data.message || 'Verification failed');
      if (data.message?.toLowerCase().includes('expired')) {
        setPwOtpExpired(true);
      }
    }
  };

  // ── Loading / error state ──────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Alert variant="destructive">
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={fetchProfile}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account settings</p>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <Badge variant={profile.is_active ? 'default' : 'destructive'}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline" className="capitalize">{profile.role}</Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Change Email
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1 — Profile ─────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name, address, and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Read-only info row */}
              {profile && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Email (read-only)</p>
                    <p className="text-sm font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Member since</p>
                    <p className="text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => { setProfileForm((p) => ({ ...p, first_name: e.target.value })); setProfileFieldErrors((p) => ({ ...p, first_name: '' })); }}
                    className={profileFieldErrors.first_name ? 'border-red-500' : ''}
                  />
                  {profileFieldErrors.first_name && <p className="text-xs text-red-500">{profileFieldErrors.first_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => { setProfileForm((p) => ({ ...p, last_name: e.target.value })); setProfileFieldErrors((p) => ({ ...p, last_name: '' })); }}
                    className={profileFieldErrors.last_name ? 'border-red-500' : ''}
                  />
                  {profileFieldErrors.last_name && <p className="text-xs text-red-500">{profileFieldErrors.last_name}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <PhoneInput
                  value={profileForm.mobile_number}
                  onChange={(v) => { setProfileForm((p) => ({ ...p, mobile_number: v })); setProfileFieldErrors((p) => ({ ...p, mobile_number: '' })); }}
                />
                {profileFieldErrors.mobile_number && <p className="text-xs text-red-500">{profileFieldErrors.mobile_number}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={profileForm.country}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, country: e.target.value })); setProfileFieldErrors((p) => ({ ...p, country: '' })); }}
                  placeholder="Sri Lanka"
                  className={profileFieldErrors.country ? 'border-red-500' : ''}
                />
                {profileFieldErrors.country && <p className="text-xs text-red-500">{profileFieldErrors.country}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  value={profileForm.address_line_1}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, address_line_1: e.target.value })); setProfileFieldErrors((p) => ({ ...p, address_line_1: '' })); }}
                  placeholder="123 Main Street"
                  className={profileFieldErrors.address_line_1 ? 'border-red-500' : ''}
                />
                {profileFieldErrors.address_line_1 && <p className="text-xs text-red-500">{profileFieldErrors.address_line_1}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  value={profileForm.address_line_2}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, address_line_2: e.target.value })); }}
                  placeholder="Apt 4B (optional)"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2 — Change Email ─────────────────────────────────────────── */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Change Email Address</CardTitle>
              <CardDescription>
                A verification code will be sent to your <strong>new</strong> email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailStep === 1 ? (
                /* Step 1 — enter new email */
                <div className="space-y-4 max-w-sm">
                  {profile && (
                    <div className="p-3 bg-muted/40 rounded-lg text-sm">
                      <span className="text-muted-foreground">Current email: </span>
                      <span className="font-medium">{profile.email}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="new_email">New Email Address</Label>
                    <Input
                      id="new_email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); }}
                      placeholder="newemail@example.com"
                      disabled={emailLoading}
                    />
                  </div>
                  {emailError && (
                    <Alert variant="destructive">
                      <AlertDescription>{emailError}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={() => handleEmailRequest()}
                    disabled={emailLoading || !newEmail.trim()}
                    className="w-full"
                  >
                    {emailLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                    {emailLoading ? 'Sending…' : 'Send Verification Code'}
                  </Button>
                </div>
              ) : (
                /* Step 2 — enter OTP */
                <div className="space-y-5 max-w-sm">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <ShieldCheck className="h-4 w-4 inline mr-1" />
                    Code sent to <strong>{newEmail}</strong>. Check your new inbox.
                  </div>

                  <div className="space-y-3">
                    <Label className="block text-center">Enter 6-digit code</Label>
                    <OtpInput value={emailOtp} onChange={setEmailOtp} disabled={emailLoading} />
                    {!emailOtpExpired && emailOtpSentAt > 0 && (
                      <OtpTimer
                        startedAt={emailOtpSentAt}
                        ttlSeconds={600}
                        onExpire={() => setEmailOtpExpired(true)}
                      />
                    )}
                    {emailOtpExpired && (
                      <p className="text-sm text-center text-red-500">Code expired.</p>
                    )}
                  </div>

                  {emailError && (
                    <Alert variant="destructive">
                      <AlertDescription>{emailError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleEmailVerify}
                    disabled={emailLoading || emailOtp.length < 6 || emailOtpExpired}
                    className="w-full"
                  >
                    {emailLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {emailLoading ? 'Verifying…' : 'Verify & Update Email'}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setEmailStep(1); setEmailOtp(''); setEmailError(''); }}
                      className="text-muted-foreground hover:underline"
                    >
                      ← Change email address
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEmailRequest(true)}
                      disabled={emailLoading}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3 — Change Password ──────────────────────────────────────── */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                First verify your current password, then enter a code sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pwStep === 1 ? (
                /* Step 1 — confirm current password */
                <div className="space-y-4 max-w-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); setPwError(''); }}
                        placeholder="Your current password"
                        disabled={pwLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {pwError && (
                    <Alert variant="destructive">
                      <AlertDescription>{pwError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={() => handlePwRequest()}
                    disabled={pwLoading || !currentPassword.trim()}
                    className="w-full"
                  >
                    {pwLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    {pwLoading ? 'Verifying…' : 'Verify & Send Code'}
                  </Button>
                </div>
              ) : (
                /* Step 2 — OTP + new password */
                <div className="space-y-5 max-w-sm">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <ShieldCheck className="h-4 w-4 inline mr-1" />
                    Code sent to your current email address. Check your inbox.
                  </div>

                  <div className="space-y-3">
                    <Label className="block text-center">Enter 6-digit code</Label>
                    <OtpInput value={pwOtp} onChange={setPwOtp} disabled={pwLoading} />
                    {!pwOtpExpired && pwOtpSentAt > 0 && (
                      <OtpTimer
                        startedAt={pwOtpSentAt}
                        ttlSeconds={600}
                        onExpire={() => setPwOtpExpired(true)}
                      />
                    )}
                    {pwOtpExpired && (
                      <p className="text-sm text-center text-red-500">Code expired.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPwError(''); }}
                        placeholder="Min. 8 characters"
                        disabled={pwLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {pwError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {pwError}
                        {(pwError.toLowerCase().includes('expired')) && (
                          <span className="block mt-1 font-medium">
                            Please go back and verify your current password again to get a new code.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handlePwVerify}
                    disabled={pwLoading || pwOtp.length < 6 || !newPassword || pwOtpExpired}
                    className="w-full"
                  >
                    {pwLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                    {pwLoading ? 'Changing…' : 'Change Password'}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setPwStep(1); setPwOtp(''); setPwError(''); setCurrentPassword(''); }}
                      className="text-muted-foreground hover:underline"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePwRequest(true)}
                      disabled={pwLoading}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
