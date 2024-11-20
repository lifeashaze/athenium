'use client'

import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { usePathname } from 'next/navigation'
import { SidebarDemo } from '@/components/Sidebar'
import '../../public/fonts/fonts.css' 
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage = 
  ['/', '/about'].includes(pathname) || 
  pathname.startsWith('/sign-in') || 
  pathname.startsWith('/sign-up') || 
  pathname.startsWith('/verify-email')

if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      <SidebarDemo />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-styrene">
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <RootLayoutContent>{children}</RootLayoutContent>
              <Toaster />
            </ThemeProvider>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
