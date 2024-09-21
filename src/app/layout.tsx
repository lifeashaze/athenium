'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"
import './globals.css'
import { usePathname } from 'next/navigation'
import { SidebarDemo } from '@/components/Sidebar'

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage = ['/', '/about', '/sign-in', '/sign-up', '/verify-email-address']

  if (isPublicPage.includes(pathname)) {
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
    <ClerkProvider>
      <html lang="en">
        <body>
          <RootLayoutContent>{children}</RootLayoutContent>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}