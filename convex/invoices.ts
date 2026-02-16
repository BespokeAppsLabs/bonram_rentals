import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ============================================
// INVOICES
// Create, manage, and query invoices
// ============================================

/**
 * Internal handler for creating invoices
 */
async function createInvoiceHandler(ctx: any, args: {
    quotationId: any;
    docType: "invoice" | "quotation";
    dueDate: number;
}) {
    const { quotationId, docType, dueDate } = args;
    const quotation = await ctx.db.get(quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const allInvoices = await ctx.db.query("invoices").collect();
    const prefix = docType === "invoice" ? "INV" : "QUO";
    const year = new Date().getFullYear();
    const count = allInvoices.length + 1;
    const invoiceNumber = `${prefix}-${year}-${String(count).padStart(3, "0")}`;

    const subtotal = quotation.subtotal;
    const vatAmount = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + vatAmount;

    const now = Date.now();
    return await ctx.db.insert("invoices", {
        quotationId,
        invoiceNumber,
        docType,
        issuedDate: now,
        dueDate,
        status: "draft",
        subtotal,
        vatAmount,
        total,
        createdAt: now,
        templateStyle: quotation.templateStyle,
        branding: quotation.branding,
    });
}

/**
 * Create an invoice from a quotation
 */
export const create = mutation({
    args: {
        quotationId: v.id("quotations"),
        docType: v.union(v.literal("invoice"), v.literal("quotation")),
        dueDate: v.number(),
    },
    handler: async (ctx, args) => {
        return await createInvoiceHandler(ctx, args);
    },
});

/**
 * Convert a quotation to an invoice (replaces existing if any, or creates new)
 */
export const convertToInvoice = mutation({
    args: { quotationId: v.id("quotations") },
    handler: async (ctx, args) => {
        const dueDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
        return await createInvoiceHandler(ctx, {
            quotationId: args.quotationId,
            docType: "invoice",
            dueDate,
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
    args: { id: v.string() },
    handler: async (ctx, args) => {
        // Safe fetch from invoices table only
        const invoice = await ctx.db.get(args.id as Id<"invoices">);

        // If it's not in the invoices table, or it's a different record type, return null
        if (!invoice || !('quotationId' in invoice)) return null;

        const quotation = await ctx.db.get(invoice.quotationId);
        if (!quotation) return null;

        const items = await ctx.db
            .query("quotationItems")
            .withIndex("by_quotation", (q) => q.eq("quotationId", invoice.quotationId))
            .collect();

        // Get product details for catalog items, or use description for manual items
        const lineItems = await Promise.all(
            items.map(async (item) => {
                if (item.productId) {
                    const product = await ctx.db.get(item.productId);
                    return {
                        ...item,
                        productName: product?.name ?? item.description,
                        productCategory: product?.category ?? "Manual",
                    };
                }
                return {
                    ...item,
                    productName: item.description,
                    productCategory: "Manual",
                };
            })
        );

        return {
            invoice: invoice as any,
            quotation,
            lineItems
        };
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

/**
 * Update document settings (template and branding)
 */
export const updateSettings = mutation({
    args: {
        id: v.id("invoices"),
        templateStyle: v.optional(v.string()),
        branding: v.optional(v.object({
            logoX: v.number(),
            logoY: v.number(),
            logoScale: v.number(),
            logoOpacity: v.number(),
            logoIsBack: v.boolean(),
            logoUrl: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});
