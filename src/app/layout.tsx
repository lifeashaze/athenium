import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"
import './globals.css'
import { SidebarDemo } from "@/components/Sidebar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="flex h-screen">
            <SidebarDemo />
            <main className="flex-1 overflow-y-auto">
              {children}
              <Toaster />
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}