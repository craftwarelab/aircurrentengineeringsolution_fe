'use client';

import { useAuth } from '@/components/providers/auth-provider';

export default function AuthRestoreOverlay() {
  const { restoring } = useAuth();

  if (!restoring) return null;

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-background/60 flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-border border-t-accent animate-spin" />
      </div>
    </div>
  );
}
