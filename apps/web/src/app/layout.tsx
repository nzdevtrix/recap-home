import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recap Home - Delivery & Logistics Platform",
  description: "Real-time tracking, multi-role support, and AI-powered assistance for all your delivery needs in Italy",
  keywords: ["delivery", "logistics", "food delivery", "rider", "courier", "Italy"],
  authors: [{ name: "Recap Home" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://recap.home",
    siteName: "Recap Home",
    title: "Recap Home - Delivery & Logistics Platform",
    description: "Real-time tracking, multi-role support, and AI-powered assistance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recap Home - Delivery & Logistics Platform",
    description: "Real-time tracking, multi-role support, and AI-powered assistance",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <Navigation />
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}