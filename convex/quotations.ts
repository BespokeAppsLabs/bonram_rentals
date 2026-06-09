import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, getAuthUser } from "./auth.helpers";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";

const quotationStatus = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("reviewing"),
  v.literal("sent_to_client"),
  v.literal("confirmed"),
  v.literal("cancelled"),
);

const eventDetailsValidator = v.object({
  location: v.string(),
  locationLat: v.optional(v.number()),
  locationLng: v.optional(v.number()),
  guestCount: v.number(),
  startDate: v.number(),
  endDate: v.number(),
  eventType: v.optional(v.string()),
});

const customerContactValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  company: v.optional(v.string()),
});

async function requireQuotationAccess(
  ctx: QueryCtx | MutationCtx,
  quotationId: Id<"quotations">,
) {
  const quotation = await ctx.db.get(quotationId);
  if (!quotation) throw new Error("Quotation not found");
  const user = await getAuthUser(ctx);
  if (!user) throw new Error("Authentication required");
  if (user.role === "admin" || user.role === "staff" || quotation.userId === user._id) {
    return quotation;
  }
  throw new Error("Insufficient permissions");
}

function validateEventDetails(eventDetails: {
  location: string;
  guestCount: number;
  startDate: number;
  endDate: number;
}) {
  if (!eventDetails.location.trim()) throw new Error("Location is required");
  if (!Number.isInteger(eventDetails.guestCount) || eventDetails.guestCount < 1) {
    throw new Error("Guest count must be at least 1");
  }
  if (eventDetails.startDate < Date.now() - 86_400_000) {
    throw new Error("Event start date cannot be in the past");
  }
  if (eventDetails.endDate < eventDetails.startDate) {
    throw new Error("Event end date must be after start date");
  }
}

function validateContact(contact: { name: string; email: string; phone: string }) {
  if (!contact.name.trim()) throw new Error("Name is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) throw new Error("Valid email is required");
  if (contact.phone.replace(/\D/g, "").length < 9) throw new Error("Valid phone number is required");
}

// ============================================
// QUOTATION QUERIES
// ============================================

/**
 * Get all quotations (Admin only)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
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
  args: { status: quotationStatus },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", args.status))
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
    const quotation = await requireQuotationAccess(ctx, args.id);

    const items = await ctx.db
      .query("quotationItems")
      .withIndex("by_quotation", (q) => q.eq("quotationId", args.id))
      .collect();

    return { ...quotation, items };
  },
});
/**
 * Get quotations for a specific user
 */
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Authentication required");
    if (user.role !== "admin" && user.role !== "staff" && user._id !== args.userId) {
      throw new Error("Insufficient permissions");
    }
    return await ctx.db
      .query("quotations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
/**
 * Create a new quotation with full details
 */
export const create = mutation({
  args: {
    eventDetails: eventDetailsValidator,
    customerContact: customerContactValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateEventDetails(args.eventDetails);
    validateContact(args.customerContact);
    const now = Date.now();
    return await ctx.db.insert("quotations", {
      status: "draft",
      eventDetails: args.eventDetails,
      customerContact: args.customerContact,
      subtotal: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Create a new standalone quotation (starts as draft, no event details required initially)
 */
export const createStandalone = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("quotations", {
      status: "draft",
      eventDetails: {
        location: "TBD",
        guestCount: 0,
        startDate: now,
        endDate: now + 86400000, // +1 day default
      },
      customerContact: {
        name: args.customerName,
        email: args.customerEmail,
        phone: "",
      },
      subtotal: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Add item to quotation (now supports manual entry)
 */
export const addItem = mutation({
  args: {
    quotationId: v.id("quotations"),
    productId: v.optional(v.id("products")),
    description: v.string(),
    uom: v.optional(v.string()),
    quantity: v.number(),
    priceAtTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!Number.isInteger(args.quantity) || args.quantity < 1 || args.priceAtTime < 0) {
      throw new Error("Invalid quotation item");
    }
    const { quotationId, ...itemData } = args;
    const lineTotal = itemData.priceAtTime * itemData.quantity;

    await ctx.db.insert("quotationItems", {
      quotationId,
      ...itemData,
      lineTotal,
    });

    await updateQuotationTotals(ctx, quotationId);
  },
});

/**
 * Batch sync document data and line items
 */
export const syncDocumentData = mutation({
  args: {
    id: v.id("quotations"),
    customerContact: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      company: v.optional(v.string()),
      address: v.optional(v.string()),
      vatNumber: v.optional(v.string()),
    })),
    logistics: v.optional(v.object({
      vendorNo: v.optional(v.string()),
      poNumber: v.optional(v.string()),
      grNumber: v.optional(v.string()),
    })),
    banking: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      branchCode: v.string(),
    })),
    lineItems: v.array(v.object({
      id: v.optional(v.string()), // Existing ID or undefined for new
      description: v.string(),
      uom: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, customerContact, logistics, banking, lineItems } = args;
    const now = Date.now();

    // 1. Update metadata
    const updates: any = { updatedAt: now };
    if (customerContact) updates.customerContact = customerContact;
    if (logistics) updates.logistics = logistics;
    if (banking) updates.banking = banking;

    if (Object.keys(updates).length > 1) { // more than just timestamp
      await ctx.db.patch(id, updates);
    }

    // 2. Clear existing items and replace (simple sync)
    // Alternatively, we could do a smart diff, but for the studio replace is safer/easier
    const existingItems = await ctx.db
      .query("quotationItems")
      .withIndex("by_quotation", (q) => q.eq("quotationId", id))
      .collect();

    for (const item of existingItems) {
      await ctx.db.delete(item._id);
    }

    let subtotal = 0;
    for (const item of lineItems) {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;
      await ctx.db.insert("quotationItems", {
        quotationId: id,
        description: item.description,
        uom: item.uom,
        quantity: item.quantity,
        priceAtTime: item.unitPrice,
        lineTotal,
      });
    }

    // 3. Update totals
    const quotation = await ctx.db.get(id);
    const deliveryFee = quotation?.deliveryFee ?? 0;
    const discount = quotation?.discount ?? 0;
    const total = subtotal + deliveryFee - discount;

    await ctx.db.patch(id, {
      subtotal,
      total,
      updatedAt: now,
    });
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    if (!Number.isInteger(args.quantity) || args.quantity < 1) throw new Error("Invalid quantity");
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
    status: quotationStatus,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      status: args.status,
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
    await requireQuotationAccess(ctx, args.id);

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
    await requireAdmin(ctx);
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
 * Update document settings (template and branding)
 */
export const updateSettings = mutation({
  args: {
    id: v.id("quotations"),
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
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

/**
 * Update event details
 */
export const updateEventDetails = mutation({
  args: {
    id: v.id("quotations"),
    eventDetails: eventDetailsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateEventDetails(args.eventDetails);
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

async function updateQuotationTotals(ctx: MutationCtx, quotationId: Id<"quotations">) {
  const items = await ctx.db
    .query("quotationItems")
    .withIndex("by_quotation", (q) => q.eq("quotationId", quotationId))
    .collect();

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

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

export const submitQuote = mutation({
  args: {
    eventDetails: eventDetailsValidator,
    customerContact: customerContactValidator,
    specialRequests: v.optional(v.string()),
    source: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    validateEventDetails(args.eventDetails);
    validateContact(args.customerContact);
    if (args.items.length === 0) throw new Error("Select at least one item");

    const now = Date.now();
    const days = Math.max(1, Math.ceil((args.eventDetails.endDate - args.eventDetails.startDate) / 86_400_000));
    const user = await getAuthUser(ctx);
    const validatedItems: Array<{
      productId: Id<"products">;
      description: string;
      quantity: number;
      priceAtTime: number;
      lineTotal: number;
    }> = [];

    for (const item of args.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("Invalid item quantity");
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) throw new Error("Selected product is unavailable");
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_product", (q) => q.eq("productId", item.productId))
        .filter((q) => q.and(
          q.lt(q.field("startDate"), args.eventDetails.endDate),
          q.gt(q.field("endDate"), args.eventDetails.startDate),
          q.or(q.eq(q.field("status"), "reserved"), q.eq(q.field("status"), "confirmed")),
        ))
        .collect();
      const booked = bookings.reduce((sum, booking) => sum + booking.quantity, 0);
      if (item.quantity > product.totalStock - booked) {
        throw new Error(`${product.name} no longer has enough stock for selected dates`);
      }
      validatedItems.push({
        productId: item.productId,
        description: product.name,
        quantity: item.quantity,
        priceAtTime: product.dailyRate,
        lineTotal: product.dailyRate * item.quantity * days,
      });
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const publicReference = `BR-${new Date(now).getFullYear()}-${now.toString(36).toUpperCase()}`;
    const quotationId = await ctx.db.insert("quotations", {
      userId: user?._id,
      publicReference,
      submittedAt: now,
      specialRequests: args.specialRequests?.trim() || undefined,
      source: args.source,
      status: "pending_review",
      eventDetails: args.eventDetails,
      customerContact: args.customerContact,
      subtotal,
      total: subtotal,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of validatedItems) {
      await ctx.db.insert("quotationItems", { quotationId, ...item });
    }
    await ctx.db.insert("funnelEvents", { event: "quote_submitted", source: args.source, createdAt: now });
    await ctx.scheduler.runAfter(0, internal.notifications.sendQuoteSubmitted, {
      publicReference,
      customerName: args.customerContact.name,
      customerEmail: args.customerContact.email,
      customerPhone: args.customerContact.phone,
      location: args.eventDetails.location,
      startDate: args.eventDetails.startDate,
    });
    return { quotationId, publicReference };
  },
});
