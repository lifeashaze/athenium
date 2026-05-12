import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import '../../public/fonts/fonts.css' 
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { AppShell } from '@/components/layout/AppShell'

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
              forcedTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <AppShell>{children}</AppShell>
              <Toaster />
            </ThemeProvider>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
