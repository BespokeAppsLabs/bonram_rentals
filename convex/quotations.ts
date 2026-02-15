import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// QUOTATION QUERIES
// ============================================

/**
 * Get all quotations (Admin only)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("quotations")
      .order("desc")
      .collect();
  },
});

/**
 * Get quotations by status (for Kanban)
 */
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", args.status as "draft" | "pending_review" | "reviewing" | "sent_to_client" | "confirmed" | "cancelled"))
      .order("desc")
      .collect();
  },
});

/**
 * Get a single quotation with items
 */
export const getById = query({
  args: { id: v.id("quotations") },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.id);
    if (!quotation) return null;

    const items = await ctx.db
      .query("quotationItems")
      .withIndex("by_quotation", (q) => q.eq("quotationId", args.id))
      .collect();

    // Fetch product details for each item
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    return { ...quotation, items: itemsWithProducts };
  },
});

/**
 * Get quotations for a user
 */
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quotations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ============================================
// QUOTATION MUTATIONS
// ============================================

/**
 * Create a new draft quotation
 */
export const create = mutation({
  args: {
    eventDetails: v.object({
      location: v.string(),
      locationLat: v.optional(v.number()),
      locationLng: v.optional(v.number()),
      guestCount: v.number(),
      startDate: v.number(),
      endDate: v.number(),
      eventType: v.optional(v.string()),
    }),
    customerContact: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      company: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("quotations", {
      ...args,
      status: "draft",
      subtotal: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Add item to quotation
 */
export const addItem = mutation({
  args: {
    quotationId: v.id("quotations"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Calculate line total
    const days = Math.ceil(
      (quotation.eventDetails.endDate - quotation.eventDetails.startDate) / (1000 * 60 * 60 * 24)
    ) || 1;
    const lineTotal = product.dailyRate * args.quantity * days;

    // Add item
    await ctx.db.insert("quotationItems", {
      quotationId: args.quotationId,
      productId: args.productId,
      quantity: args.quantity,
      priceAtTime: product.dailyRate,
      lineTotal,
    });

    // Update quotation totals
    await updateQuotationTotals(ctx, args.quotationId);
  },
});

/**
 * Remove item from quotation
 */
export const removeItem = mutation({
  args: {
    itemId: v.id("quotationItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    await ctx.db.delete(args.itemId);
    await updateQuotationTotals(ctx, item.quotationId);
  },
});

/**
 * Update item quantity
 */
export const updateItemQuantity = mutation({
  args: {
    itemId: v.id("quotationItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const quotation = await ctx.db.get(item.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const days = Math.ceil(
      (quotation.eventDetails.endDate - quotation.eventDetails.startDate) / (1000 * 60 * 60 * 24)
    ) || 1;
    const lineTotal = item.priceAtTime * args.quantity * days;

    await ctx.db.patch(args.itemId, {
      quantity: args.quantity,
      lineTotal,
    });

    await updateQuotationTotals(ctx, item.quotationId);
  },
});

/**
 * Update quotation status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("quotations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status as "draft" | "pending_review" | "reviewing" | "sent_to_client" | "confirmed" | "cancelled",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Submit quotation for review
 */
export const submitForReview = mutation({
  args: {
    id: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.id);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(args.id, {
      status: "pending_review",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update quotation pricing (Admin)
 */
export const updatePricing = mutation({
  args: {
    id: v.id("quotations"),
    deliveryFee: v.optional(v.number()),
    discount: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    await updateQuotationTotals(ctx, id);
  },
});

/**
 * Update event details
 */
export const updateEventDetails = mutation({
  args: {
    id: v.id("quotations"),
    eventDetails: v.object({
      location: v.string(),
      locationLat: v.optional(v.number()),
      locationLng: v.optional(v.number()),
      guestCount: v.number(),
      startDate: v.number(),
      endDate: v.number(),
      eventType: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      eventDetails: args.eventDetails,
      updatedAt: Date.now(),
    });

    // Recalculate all line totals
    const items = await ctx.db
      .query("quotationItems")
      .withIndex("by_quotation", (q) => q.eq("quotationId", args.id))
      .collect();

    const days = Math.ceil(
      (args.eventDetails.endDate - args.eventDetails.startDate) / (1000 * 60 * 60 * 24)
    ) || 1;

    for (const item of items) {
      const lineTotal = item.priceAtTime * item.quantity * days;
      await ctx.db.patch(item._id, { lineTotal });
    }

    await updateQuotationTotals(ctx, args.id);
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updateQuotationTotals(ctx: any, quotationId: any) {
  const items = await ctx.db
    .query("quotationItems")
    .withIndex("by_quotation", (q: any) => q.eq("quotationId", quotationId))
    .collect();

  const subtotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
  
  const quotation = await ctx.db.get(quotationId);
  const deliveryFee = quotation?.deliveryFee ?? 0;
  const discount = quotation?.discount ?? 0;
  const total = subtotal + deliveryFee - discount;

  await ctx.db.patch(quotationId, {
    subtotal,
    total,
    updatedAt: Date.now(),
  });
}
