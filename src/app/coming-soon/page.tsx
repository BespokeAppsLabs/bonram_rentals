"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui";
import { ArrowLeft, Clock, Bell } from "lucide-react";

// ============================================
// COMING SOON PAGE
// Professional branded placeholder
// ============================================

export default function ComingSoonPage() {
    return (
        <>
            <Header />

            <main className="min-h-[60vh] flex items-center justify-center bg-mist">
                <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-navy/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Clock className="w-10 h-10 text-navy" />
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">
                        Coming Soon
                    </h1>

                    {/* Description */}
                    <p className="text-gray text-lg mb-8 leading-relaxed">
                        We&apos;re working hard to bring you this page. In the meantime,
                        explore our equipment catalog or request a quote for your next event.
                    </p>

                    {/* Decorative divider */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="h-px w-16 bg-gold/40" />
                        <Bell className="w-5 h-5 text-gold" />
                        <div className="h-px w-16 bg-gold/40" />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/catalog">
                            <Button variant="gold" size="lg">
                                Browse Equipment
                            </Button>
                        </a>
                        <a href="/">
                            <Button variant="outline" size="lg">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Back to Home
                            </Button>
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
