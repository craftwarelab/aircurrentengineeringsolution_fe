'use client';

import { useEffect } from 'react';
import { AuthUtils } from '@/lib/auth';

// Silently restores the access token on every page load using the HttpOnly
// 'token' refresh cookie. Runs before any admin layout auth check.
export default function AuthInitializer() {
  useEffect(() => {
    const init = async () => {
      if (!AuthUtils.getAccessToken() || AuthUtils.isTokenExpired()) {
        await AuthUtils.refreshAccessToken();
      }
    };
    init();
  }, []);

  return null;
}
