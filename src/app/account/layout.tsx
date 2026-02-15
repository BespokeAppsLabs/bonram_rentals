"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { User, FileText, Package, LogOut, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
    { href: "/account", label: "Profile", icon: User },
    { href: "/account/rentals", label: "My Rentals", icon: Package },
    { href: "/account/invoices", label: "Invoices", icon: FileText },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-mist flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-mist flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-heading font-bold text-navy mb-4">Sign In Required</h1>
                    <p className="text-gray mb-6">Sign in to view your account.</p>
                    <a href="/sign-in" className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors">
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mist">
            {/* Header */}
            <div className="bg-white border-b border-gray-light">
                <div className="container mx-auto px-4 flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">B</span>
                            </div>
                            <span className="font-heading font-bold text-navy">BONRAM</span>
                        </a>
                        <span className="text-gray">|</span>
                        <span className="text-sm font-medium text-charcoal">My Account</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-charcoal" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <a href="/api/auth/signout" className="hidden md:flex items-center gap-2 text-sm text-gray hover:text-navy transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex gap-8">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed md:sticky top-16 left-0 z-40 w-64 md:w-56 bg-white md:bg-transparent rounded-xl md:rounded-none border md:border-0 border-gray-light p-4 md:p-0 transition-transform md:translate-x-0 md:block shrink-0",
                    sidebarOpen ? "translate-x-4" : "-translate-x-full"
                )}>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive ? "bg-navy/5 text-navy" : "text-gray hover:text-navy hover:bg-mist"
                                    )}>
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}
