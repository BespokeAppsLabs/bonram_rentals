import type { Metadata } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { UserSync } from "@/components/auth/UserSync";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://bonramrentals.co.za"),
  title: "Bonram Rentals | Professional Event Equipment Hire",
  description: "Presidential-grade event equipment hire trusted by South Africa's biggest institutions. Tents, sanitation, power, audio, and more for weddings, corporate events, and government functions.",
  keywords: ["event hire", "equipment rental", "tents", "sanitation", "generators", "sound systems", "South Africa", "Lephalale"],
  authors: [{ name: "Bonram Rentals" }],
  openGraph: {
    title: "Bonram Rentals | Professional Event Equipment Hire",
    description: "Presidential-grade event equipment hire trusted by South Africa's biggest institutions.",
    url: "https://bonramrentals.co.za",
    siteName: "Bonram Rentals",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bonram Rentals | Professional Event Equipment Hire",
    description: "Presidential-grade event equipment hire trusted by South Africa's biggest institutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
    </ClerkProvider>
  );
}
