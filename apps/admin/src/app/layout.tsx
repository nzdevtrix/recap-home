import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProviderComponent as ToastProvider } from "@/components/ToastProvider"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Recap Home - Infrastructure Management Portal",
  description: "Control Center for Recap Home Delivery Platform - Manage users, businesses, riders, orders, and system settings",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Header */}
              <Header />
              
              {/* Page Content */}
              <main className="flex-1 p-4 lg:p-6">
                {children}
              </main>
              
              {/* Footer */}
              <footer className="border-t py-4 px-6 text-sm text-muted-foreground">
                <div className="container mx-auto flex items-center justify-between">
                  <p>&copy; {new Date().getFullYear()} Recap Home. All rights reserved.</p>
                  <p>Infrastructure Management Portal v1.0.0</p>
                </div>
              </footer>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}