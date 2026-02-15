"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    LayoutDashboard,
    Package,
    Users,
    BarChart3,
    LogOut,
    Menu,
    ChevronRight,
    FileText,
    User,
    ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ============================================
// ADMIN LAYOUT
// Role-based sidebar: staff/admin see full admin tools,
// customers see profile, rentals, invoices only
// ============================================

// Staff/Admin navigation
const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/invoices", label: "Invoices", icon: FileText },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

// Customer navigation
const customerNavItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/profile", label: "My Profile", icon: User },
    { href: "/admin/my-rentals", label: "My Rentals", icon: ShoppingBag },
    { href: "/admin/my-invoices", label: "My Invoices", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get user session from Convex (consolidated roles/permissions)
    const session = useQuery(api.users.getUserSession);
    const dbUser = session?.user;
    const userRole = session?.role ?? "customer";
    const isStaff = session?.permissions?.canAccessAdmin ?? false;

    // Allow staff sign-in page to render without layout
    if (pathname === "/admin/sign-in") {
        return <>{children}</>;
    }

    // Loading state (WorkOS or Convex)
    // We stay in loading if:
    // 1. WorkOS is still loading
    // 2. We are logged in but Convex hasn't returned any session data yet (undefined)
    // 3. We are logged in, session returned but user record still pending
    const isSyncing = user && session?.role === "pending";

    if (loading || session === undefined || isSyncing) {
        return (
            <div className="min-h-screen bg-mist flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
                    <p className="text-navy font-medium">Validating your credentials...</p>
                    <p className="text-navy/60 text-sm max-w-[280px]">
                        Please wait while we synchronize your administrative access.
                    </p>
                </div>
            </div>
        );
    }

    // Not authenticated or not staff
    if (!user) {
        return (
            <div className="min-h-screen bg-mist flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-heading font-bold text-navy mb-4">Sign In Required</h1>
                    <p className="text-gray mb-6">Please sign in to access your dashboard.</p>
                    <Link
                        href="/admin/sign-in"
                        className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const handleSignOut = async () => {
        await signOut({ returnTo: "/" });
    };

    // Role-based access control
    // Staff get full admin navigation, customers get limited view
    // (The blocking logic was removed to allow customers to view their profile/invoices/rentals)

    const navItems = isStaff ? adminNavItems : customerNavItems;
    const portalLabel = isStaff ? "ADMIN" : "PORTAL";
    const dashboardLabel = isStaff ? "Admin Dashboard" : "My Account";

    return (
        <div className="min-h-screen bg-mist flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-navy text-white flex flex-col transition-transform duration-200",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <a href="/" className="flex items-center gap-3">
                        <div className="relative h-14 w-auto">
                            <img
                                src="/bonram-rentals-logo.jpeg"
                                alt="Bonram Rentals"
                                className="h-full w-auto object-contain brightness-0 invert"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-bold text-sm tracking-widest text-gold uppercase">{portalLabel}</span>
                        </div>
                    </a>
                </div>

                {/* Role Badge */}
                {isStaff && (
                    <div className="px-6 py-2 border-b border-white/10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold capitalize">
                            {userRole}
                        </span>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white/10 text-gold"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info + Sign Out */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                            <span className="text-gold text-sm font-bold">
                                {user.firstName?.[0] ?? user.email?.[0]?.toUpperCase() ?? "?"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "User"}
                            </p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Top Bar (mobile) */}
                <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-light p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="text-navy">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="h-8 w-auto mix-blend-multiply">
                            <img
                                src="/bonram-rentals-logo.jpeg"
                                alt="Bonram Rentals"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </div>
                    <span className="font-heading font-bold text-sm text-navy tracking-widest uppercase">{portalLabel}</span>
                </div>

                {/* Page Content */}
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
