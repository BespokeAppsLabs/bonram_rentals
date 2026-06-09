"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import {
    Package,
    FileText,
    TrendingUp,
    Users,
    AlertCircle,
    User,
    ShoppingBag,
} from "lucide-react";
import Link from "next/link";

// ============================================
// DASHBOARD — Role-aware overview
// Staff/Admin → analytics stats
// Customer → welcome + quick links
// ============================================

export default function DashboardPage() {
    // Use getUserSession for consistent auth handling (same as layout.tsx)
    const session = useQuery(api.users.getUserSession);
    const dbUser = session?.user;
    const userRole = session?.role ?? "customer";
    const isStaff = userRole === "admin" || userRole === "staff";

    if (!session || !dbUser) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
            </div>
        );
    }

    if (isStaff) {
        return <AdminDashboard />;
    }

    return <CustomerDashboard userName={dbUser.name ?? "there"} />;
}

// ============================================
// CUSTOMER DASHBOARD
// ============================================

function CustomerDashboard({ userName }: { userName: string }) {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-navy">
                    Welcome, {userName}
                </h1>
                <p className="text-gray mt-1">Manage your rentals and invoices from here.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickAction
                    href="/admin/profile"
                    icon={<User className="w-5 h-5" />}
                    title="My Profile"
                    description="Update your contact and billing details"
                />
                <QuickAction
                    href="/admin/my-rentals"
                    icon={<ShoppingBag className="w-5 h-5" />}
                    title="My Rentals"
                    description="View your quotation & rental history"
                />
                <QuickAction
                    href="/admin/my-invoices"
                    icon={<FileText className="w-5 h-5" />}
                    title="My Invoices"
                    description="View and print your invoices"
                />
                <QuickAction
                    href="/catalog"
                    icon={<Package className="w-5 h-5" />}
                    title="Browse Equipment"
                    description="Explore our full equipment catalog"
                />
            </div>
        </div>
    );
}

// ============================================
// ADMIN DASHBOARD
// ============================================

function AdminDashboard() {
    const stats = useQuery(api.analytics.getOverviewStats);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-navy">Dashboard</h1>
                <p className="text-gray mt-1">Overview of your rental business</p>
            </div>

            {/* Stats Grid */}
            {!stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-light rounded w-24 mb-4" />
                            <div className="h-8 bg-gray-light rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Package className="w-6 h-6" />}
                        label="Active Products"
                        value={`${stats.activeProducts} / ${stats.totalProducts}`}
                        sublabel={`${stats.totalStock} total stock`}
                        color="navy"
                    />
                    <StatCard
                        icon={<FileText className="w-6 h-6" />}
                        label="Pending Quotes"
                        value={String(stats.pendingQuotes)}
                        sublabel={`${stats.confirmedQuotes} confirmed`}
                        color="gold"
                        highlight={stats.pendingQuotes > 0}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        sublabel={`${stats.totalQuotes} total quotes`}
                        color="green"
                    />
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        label="Staff Members"
                        value={String(stats.staffCount)}
                        sublabel={`${stats.activeBookings} active bookings`}
                        color="navy"
                    />
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-xl font-heading font-semibold text-navy mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickAction
                        href="/admin/products"
                        icon={<Package className="w-5 h-5" />}
                        title="Manage Products"
                        description="Add, edit, or deactivate equipment"
                    />
                    <QuickAction
                        href="/admin/staff"
                        icon={<Users className="w-5 h-5" />}
                        title="Invite Staff"
                        description="Add team members to the dashboard"
                    />
                    <QuickAction
                        href="/admin/analytics"
                        icon={<TrendingUp className="w-5 h-5" />}
                        title="View Analytics"
                        description="Revenue, trends, and product performance"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel: string;
    color: "navy" | "gold" | "green";
    highlight?: boolean;
}

function StatCard({ icon, label, value, sublabel, color, highlight }: StatCardProps) {
    const colorMap = {
        navy: "bg-navy/10 text-navy",
        gold: "bg-gold/10 text-gold",
        green: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div className={`bg-white rounded-xl p-6 border ${highlight ? "border-gold" : "border-gray-light"}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                    {icon}
                </div>
                {highlight && <AlertCircle className="w-5 h-5 text-gold" />}
            </div>
            <p className="text-sm text-gray font-medium">{label}</p>
            <p className="text-2xl font-bold text-navy mt-1">{value}</p>
            <p className="text-xs text-gray mt-1">{sublabel}</p>
        </div>
    );
}

// ============================================
// QUICK ACTION
// ============================================

function QuickAction({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-light hover:border-gold hover:shadow-sm transition-all group"
        >
            <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center text-navy group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-navy">{title}</p>
                <p className="text-sm text-gray">{description}</p>
            </div>
        </Link>
    );
}
