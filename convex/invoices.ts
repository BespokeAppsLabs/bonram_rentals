import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// INVOICES
// Create, manage, and query invoices
// ============================================

/**
 * Create an invoice from a confirmed quotation
 */
export const create = mutation({
    args: {
        quotationId: v.id("quotations"),
        docType: v.union(v.literal("invoice"), v.literal("quotation")),
        dueDate: v.number(),
    },
    handler: async (ctx, args) => {
        const quotation = await ctx.db.get(args.quotationId);
        if (!quotation) throw new Error("Quotation not found");

        // Auto-generate invoice number
        const allInvoices = await ctx.db.query("invoices").collect();
        const prefix = args.docType === "invoice" ? "INV" : "QUO";
        const year = new Date().getFullYear();
        const count = allInvoices.length + 1;
        const invoiceNumber = `${prefix}-${year}-${String(count).padStart(3, "0")}`;

        // Calculate VAT (15%)
        const subtotal = quotation.subtotal;
        const vatAmount = Math.round(subtotal * 0.15 * 100) / 100;
        const total = subtotal + vatAmount;

        const now = Date.now();
        return await ctx.db.insert("invoices", {
            quotationId: args.quotationId,
            invoiceNumber,
            docType: args.docType,
            issuedDate: now,
            dueDate: args.dueDate,
            subtotal,
            vatAmount,
            total,
            status: "draft",
            createdAt: now,
        });
    },
});

/**
 * Get all invoices
 */
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("invoices").order("desc").collect();
    },
});

/**
 * Get invoice by ID with full quotation + items data
 */
export const getById = query({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        const invoice = await ctx.db.get(args.id);
        if (!invoice) return null;

        const quotation = await ctx.db.get(invoice.quotationId);
        if (!quotation) return null;

        const items = await ctx.db
            .query("quotationItems")
            .withIndex("by_quotation", (q) => q.eq("quotationId", invoice.quotationId))
            .collect();

        // Get product details for each line item
        const lineItems = await Promise.all(
            items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return {
                    ...item,
                    productName: product?.name ?? "Unknown",
                    productCategory: product?.category ?? "",
                };
            })
        );

        return { invoice, quotation, lineItems };
    },
});

/**
 * Get invoices for a specific quotation
 */
export const getByQuotation = query({
    args: { quotationId: v.id("quotations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("invoices")
            .withIndex("by_quotation", (q) => q.eq("quotationId", args.quotationId))
            .collect();
    },
});

/**
 * Get invoices for a user (by their quotations)
 */
export const getForUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const quotations = await ctx.db
            .query("quotations")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const invoices = [];
        for (const q of quotations) {
            const qInvoices = await ctx.db
                .query("invoices")
                .withIndex("by_quotation", (qb) => qb.eq("quotationId", q._id))
                .collect();
            invoices.push(...qInvoices.map((inv) => ({ ...inv, quotation: q })));
        }

        return invoices.sort((a, b) => b.createdAt - a.createdAt);
    },
});

/**
 * Update invoice status
 */
export const updateStatus = mutation({
    args: {
        id: v.id("invoices"),
        status: v.union(v.literal("draft"), v.literal("sent"), v.literal("paid")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});
