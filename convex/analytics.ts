import { query } from "./_generated/server";
import { requireAdmin } from "./auth.helpers";

// ============================================
// ANALYTICS QUERIES
// Dashboard statistics and reporting
// ============================================

/**
 * Overview stats for the admin dashboard
 */
export const getOverviewStats = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const products = await ctx.db.query("products").collect();
        const quotations = await ctx.db.query("quotations").collect();
        const bookings = await ctx.db.query("bookings").collect();
        const users = await ctx.db.query("users").collect();

        const activeProducts = products.filter((p) => p.isActive).length;
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);

        const pendingQuotes = quotations.filter(
            (q) => q.status === "pending_review" || q.status === "reviewing"
        ).length;
        const confirmedQuotes = quotations.filter((q) => q.status === "confirmed").length;
        const totalQuotes = quotations.length;

        const activeBookings = bookings.filter(
            (b) => b.status === "confirmed" || b.status === "reserved"
        ).length;

        const totalRevenue = quotations
            .filter((q) => q.status === "confirmed")
            .reduce((sum, q) => sum + q.total, 0);

        const staffCount = users.filter(
            (u) => u.role === "admin" || u.role === "staff"
        ).length;

        return {
            activeProducts,
            totalProducts,
            totalStock,
            pendingQuotes,
            confirmedQuotes,
            totalQuotes,
            activeBookings,
            totalRevenue,
            staffCount,
        };
    },
});

/**
 * Revenue breakdown by category
 */
export const getRevenueByCategory = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const confirmedQuotations = await ctx.db
            .query("quotations")
            .collect();

        const confirmed = confirmedQuotations.filter((q) => q.status === "confirmed");

        // Get all items for confirmed quotations
        const categoryRevenue: Record<string, number> = {};

        for (const quotation of confirmed) {
            const items = await ctx.db
                .query("quotationItems")
                .withIndex("by_quotation", (q) => q.eq("quotationId", quotation._id))
                .collect();

            for (const item of items) {
                const product = await ctx.db.get(item.productId);
                if (product) {
                    categoryRevenue[product.category] =
                        (categoryRevenue[product.category] || 0) + item.lineTotal;
                }
            }
        }

        return Object.entries(categoryRevenue).map(([category, revenue]) => ({
            category,
            revenue,
        }));
    },
});

/**
 * Top products by booking count
 */
export const getTopProducts = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const items = await ctx.db.query("quotationItems").collect();

        // Aggregate by product, keeping the typed productId
        const productMap = new Map<string, { count: number; revenue: number }>();

        for (const item of items) {
            const key = item.productId as string;
            const existing = productMap.get(key) ?? { count: 0, revenue: 0 };
            existing.count += item.quantity;
            existing.revenue += item.lineTotal;
            productMap.set(key, existing);
        }

        // Look up product details using the typed productId from original items
        const seen = new Set<string>();
        const results = [];

        for (const item of items) {
            const key = item.productId as string;
            if (seen.has(key)) continue;
            seen.add(key);

            const data = productMap.get(key)!;
            const product = await ctx.db.get(item.productId);
            results.push({
                productId: key,
                name: product?.name ?? "Unknown",
                category: product?.category ?? "Unknown",
                totalOrdered: data.count,
                totalRevenue: data.revenue,
            });
        }

        return results.sort((a, b) => b.totalOrdered - a.totalOrdered).slice(0, 10);
    },
});

/**
 * Booking trends (monthly)
 */
export const getBookingTrends = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const quotations = await ctx.db.query("quotations").collect();

        const monthlyData: Record<string, { quotes: number; confirmed: number; revenue: number }> = {};

        for (const q of quotations) {
            const date = new Date(q.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            if (!monthlyData[key]) {
                monthlyData[key] = { quotes: 0, confirmed: 0, revenue: 0 };
            }

            monthlyData[key].quotes += 1;
            if (q.status === "confirmed") {
                monthlyData[key].confirmed += 1;
                monthlyData[key].revenue += q.total;
            }
        }

        return Object.entries(monthlyData)
            .map(([month, data]) => ({
                month,
                ...data,
            }))
            .sort((a, b) => a.month.localeCompare(b.month));
    },
});
