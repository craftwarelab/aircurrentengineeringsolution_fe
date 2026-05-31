'use client';

import { ReactNode } from 'react';

// Dynamic import to handle missing swr package
let SWRConfig: any = null;
let swrConfig: any = null;

try {
  const swrModule = require('swr');
  const configModule = require('./swr-config');
  SWRConfig = swrModule.SWRConfig;
  swrConfig = configModule.swrConfig;
} catch (error) {
  console.warn('SWR not available. Please install axios and swr packages: npm install axios swr');
}

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  if (!SWRConfig) {
    return <>{children}</>;
  }

  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}