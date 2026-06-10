"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, Award, Loader2 } from "lucide-react";

export default function AdminAnalyticsPage() {
    const stats = useQuery(api.analytics.getOverviewStats);
    const revenueByCategory = useQuery(api.analytics.getRevenueByCategory);
    const topProducts = useQuery(api.analytics.getTopProducts);
    const trends = useQuery(api.analytics.getBookingTrends);
    const funnel = useQuery(api.analytics.getFunnelStats);

    const isLoading = !stats || !revenueByCategory || !topProducts || !trends || !funnel;

    if (isLoading) {
        return (
            <div>
                <h1 className="text-3xl font-heading font-bold text-navy mb-8">Analytics</h1>
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
            </div>
        );
    }

    const maxCategoryRevenue = Math.max(...revenueByCategory.map((r) => r.revenue), 1);

    return (
        <div>
            <h1 className="text-3xl font-heading font-bold text-navy mb-8">Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-light p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                        <p className="text-sm text-gray font-medium">Total Revenue</p>
                    </div>
                    <p className="text-3xl font-bold text-navy">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-gray mt-1">{stats.confirmedQuotes} confirmed quotes</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-light p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-gold" /></div>
                        <p className="text-sm text-gray font-medium">Total Quotes</p>
                    </div>
                    <p className="text-3xl font-bold text-navy">{stats.totalQuotes}</p>
                    <p className="text-xs text-gray mt-1">{stats.pendingQuotes} pending review</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-light p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center"><Award className="w-5 h-5 text-navy" /></div>
                        <p className="text-sm text-gray font-medium">Active Bookings</p>
                    </div>
                    <p className="text-3xl font-bold text-navy">{stats.activeBookings}</p>
                    <p className="text-xs text-gray mt-1">{stats.activeProducts} active products</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-light p-6 lg:col-span-2">
                    <h2 className="text-lg font-heading font-semibold text-navy mb-4">Qualified Quote Funnel</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Metric label="Catalog Views" value={String(funnel.catalogViews)} />
                        <Metric label="Items Added" value={String(funnel.itemsAdded)} />
                        <Metric label="Quotes Submitted" value={String(funnel.quoteSubmissions)} />
                        <Metric label="Conversion" value={`${funnel.conversionRate.toFixed(1)}%`} />
                    </div>
                </div>
                {/* Revenue by Category */}
                <div className="bg-white rounded-xl border border-gray-light p-6">
                    <h2 className="text-lg font-heading font-semibold text-navy mb-4">Revenue by Category</h2>
                    {revenueByCategory.length === 0 ? (
                        <p className="text-gray text-sm py-4">No revenue data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {revenueByCategory.sort((a, b) => b.revenue - a.revenue).map((item) => (
                                <div key={item.category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-navy font-medium">{item.category}</span>
                                        <span className="text-gray">{formatCurrency(item.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-mist rounded-full h-2">
                                        <div className="bg-gold rounded-full h-2 transition-all"
                                            style={{ width: `${(item.revenue / maxCategoryRevenue) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-light p-6">
                    <h2 className="text-lg font-heading font-semibold text-navy mb-4">Top Products</h2>
                    {topProducts.length === 0 ? (
                        <p className="text-gray text-sm py-4">No product data yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-light">
                                        <th className="text-left text-xs font-semibold text-gray pb-2">Product</th>
                                        <th className="text-right text-xs font-semibold text-gray pb-2">Orders</th>
                                        <th className="text-right text-xs font-semibold text-gray pb-2">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-light">
                                    {topProducts.map((p, i) => (
                                        <tr key={p.productId}>
                                            <td className="py-2.5">
                                                <p className="text-sm font-medium text-navy">{p.name}</p>
                                                <p className="text-xs text-gray">{p.category}</p>
                                            </td>
                                            <td className="text-right text-sm text-charcoal py-2.5">{p.totalOrdered}</td>
                                            <td className="text-right text-sm font-medium text-navy py-2.5">{formatCurrency(p.totalRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Booking Trends */}
                <div className="bg-white rounded-xl border border-gray-light p-6 lg:col-span-2">
                    <h2 className="text-lg font-heading font-semibold text-navy mb-4">Monthly Trends</h2>
                    {trends.length === 0 ? (
                        <p className="text-gray text-sm py-4">No trend data yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-light">
                                        <th className="text-left text-xs font-semibold text-gray pb-2">Month</th>
                                        <th className="text-right text-xs font-semibold text-gray pb-2">Quotes</th>
                                        <th className="text-right text-xs font-semibold text-gray pb-2">Confirmed</th>
                                        <th className="text-right text-xs font-semibold text-gray pb-2">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-light">
                                    {trends.map((t) => (
                                        <tr key={t.month}>
                                            <td className="py-2.5 text-sm font-medium text-navy">{t.month}</td>
                                            <td className="text-right text-sm text-charcoal py-2.5">{t.quotes}</td>
                                            <td className="text-right text-sm text-charcoal py-2.5">{t.confirmed}</td>
                                            <td className="text-right text-sm font-medium text-navy py-2.5">{formatCurrency(t.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return <div className="bg-mist p-4 rounded-lg"><p className="text-xs text-gray uppercase tracking-wide">{label}</p><p className="text-2xl font-bold text-navy mt-1">{value}</p></div>;
}
