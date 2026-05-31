import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Toaster } from '@/components/ui/sonner'
import { SWRProvider } from '@/components/providers/swr-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import AuthRestoreOverlay from '@/components/auth-restore-overlay'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Air Current Eng. Solutions - HVAC & Ventilation Solutions',
  description: 'Professional HVAC and ventilation engineering solutions for commercial and industrial applications. Expert design, installation, and maintenance services.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: 'oklch(0.25 0.08 260)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <SWRProvider>
          <AuthProvider>
            <AuthRestoreOverlay />
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </SWRProvider>
        {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
      </body>
    </html>
  )
}
