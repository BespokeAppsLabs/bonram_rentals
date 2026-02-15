import type { Metadata } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-provider";

// ============================================
// FONT CONFIGURATION
// Institutional Luxury Design System
// ============================================

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// ============================================
// METADATA
// ============================================

export const metadata: Metadata = {
  title: "Bonram Rentals | Professional Event Equipment Hire",
  description: "Presidential-grade event equipment hire trusted by South Africa's biggest institutions. Tents, sanitation, power, audio, and more for weddings, corporate events, and government functions.",
  keywords: ["event hire", "equipment rental", "tents", "sanitation", "generators", "sound systems", "South Africa", "Lephalale"],
  authors: [{ name: "Bonram Rentals" }],
  openGraph: {
    title: "Bonram Rentals | Professional Event Equipment Hire",
    description: "Presidential-grade event equipment hire trusted by South Africa's biggest institutions.",
    type: "website",
    locale: "en_ZA",
  },
};

import { UserSync } from "@/components/auth/UserSync";

// ============================================
// ROOT LAYOUT
// ============================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${montserrat.variable}`}>
      <body className="font-body antialiased">
        <ConvexClientProvider>
          <UserSync />
          <main className="min-h-screen">
            {children}
          </main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
