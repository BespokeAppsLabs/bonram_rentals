import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// AGENT API — scoped, INTERNAL functions only.
// Not publicly callable. Reachable only via the token-gated
// httpAction routes in http.ts. This is the ENTIRE surface an
// external agent can touch: 4 reads + 3 writes. No delete/clear/seed.
// ============================================

const customerValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  address: v.optional(v.string()),
  vatNumber: v.optional(v.string()),
});

// ---------- READS ----------

export const getBonramProducts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        resolvedImageUrl: p.imageStorageId
          ? await ctx.storage.getUrl(p.imageStorageId)
          : p.imageUrl ?? null,
      }))
    );
  },
});

export const getBonramProductById = internalQuery({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();
    const resolvedImageUrl = product.imageStorageId
      ? await ctx.storage.getUrl(product.imageStorageId)
      : product.imageUrl ?? null;
    return { ...product, resolvedImageUrl, bookings };
  },
});

export const getBonramQuotations = internalQuery({
  args: {},
  handler: async (ctx) => ctx.db.query("quotations").order("desc").take(100),
});

// ---------- WRITES (only 3) ----------

/** Create (or reuse by email) an invoice-only customer. Synthetic token = cannot log in. */
async function ensureInvoiceUser(
  ctx: any,
  c: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    vatNumber?: string;
  }
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", c.email))
    .first();
  if (existing) return existing._id;
  const now = Date.now();
  return await ctx.db.insert("users", {
    name: c.name,
    email: c.email,
    // "pending" is the same sentinel seed.ts/users.ts:linkUser use for invited-but-unregistered
    // users — Clerk login then merges this record by email instead of creating a duplicate.
    tokenIdentifier: "pending",
    role: "customer" as const,
    phone: c.phone,
    company: c.company,
    address: c.address,
    vatNumber: c.vatNumber,
    createdAt: now,
  });
}

/** WRITE 1 — update a product's price only. Nothing else on the product can change. */
export const agentUpdateProductPricing = internalMutation({
  args: { productId: v.id("products"), dailyRate: v.number() },
  handler: async (ctx, { productId, dailyRate }) => {
    if (!Number.isFinite(dailyRate) || dailyRate < 0)
      throw new Error("Invalid dailyRate");
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(productId, { dailyRate, updatedAt: Date.now() });
    return { productId, dailyRate };
  },
});

/** WRITE 2 — create an invoice-only user. */
export const agentCreateInvoiceUser = internalMutation({
  args: { customer: customerValidator },
  handler: async (ctx, { customer }) => {
    const userId = await ensureInvoiceUser(ctx, customer);
    return { userId };
  },
});

/** WRITE 3 — bundled: user + standalone quotation + line items + invoice, atomically. */
export const agentCreateInvoice = internalMutation({
  args: {
    customer: customerValidator,
    eventDetails: v.optional(
      v.object({
        location: v.string(),
        guestCount: v.number(),
        startDate: v.number(),
        endDate: v.number(),
        eventType: v.optional(v.string()),
      })
    ),
    items: v.array(
      v.object({
        description: v.string(),
        productId: v.optional(v.id("products")),
        uom: v.optional(v.string()),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0)
      throw new Error("At least one line item is required");
    if (
      args.eventDetails &&
      (!Number.isFinite(args.eventDetails.startDate) ||
        !Number.isFinite(args.eventDetails.endDate) ||
        args.eventDetails.startDate < 0 ||
        args.eventDetails.endDate <= args.eventDetails.startDate)
    )
      throw new Error("eventDetails.endDate must be after startDate");

    const now = Date.now();
    const userId = await ensureInvoiceUser(ctx, args.customer);
    const contact = {
      name: args.customer.name,
      email: args.customer.email,
      phone: args.customer.phone ?? "",
      company: args.customer.company,
      address: args.customer.address,
      vatNumber: args.customer.vatNumber,
    };
    const eventDetails =
      args.eventDetails ?? {
        location: "TBD",
        guestCount: 0,
        startDate: now,
        endDate: now + 86400000,
      };

    const quotationId = await ctx.db.insert("quotations", {
      userId,
      status: "confirmed" as const,
      eventDetails,
      customerContact: contact,
      subtotal: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
    });

    let subtotal = 0;
    for (const it of args.items) {
      if (
        !Number.isFinite(it.quantity) ||
        !Number.isFinite(it.unitPrice) ||
        it.quantity <= 0 ||
        it.unitPrice < 0
      )
        throw new Error("Invalid line item quantity/price");
      const lineTotal = it.unitPrice * it.quantity;
      subtotal += lineTotal;
      await ctx.db.insert("quotationItems", {
        quotationId,
        productId: it.productId,
        description: it.description,
        uom: it.uom,
        quantity: it.quantity,
        priceAtTime: it.unitPrice,
        lineTotal,
      });
    }
    // VAT — mirrors invoices.ts createInvoiceHandler. Applied to the quotation too, so the
    // quoted total matches the invoiced total instead of quietly excluding VAT.
    const vatAmount = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + vatAmount;
    await ctx.db.patch(quotationId, { subtotal, total, updatedAt: now });

    // Invoice number: read the latest invoice instead of scanning the whole table, which
    // would eventually exceed Convex's transaction read limit as invoices accumulate.
    const year = new Date().getFullYear();
    const latestInvoice = await ctx.db.query("invoices").order("desc").first();
    const parts = latestInvoice?.invoiceNumber.split("-") ?? [];
    const latestYear = parts.length === 3 ? Number(parts[1]) : null;
    const latestCount = parts.length === 3 ? Number(parts[2]) : 0;
    const count =
      latestYear === year && !Number.isNaN(latestCount) ? latestCount + 1 : 1;
    const invoiceNumber = `INV-${year}-${String(count).padStart(3, "0")}`;
    const dueDate = args.dueDate ?? now + 30 * 24 * 60 * 60 * 1000;

    const invoiceId = await ctx.db.insert("invoices", {
      quotationId,
      invoiceNumber,
      docType: "invoice" as const,
      issuedDate: now,
      dueDate,
      subtotal,
      vatAmount,
      total,
      status: "draft" as const,
      createdAt: now,
      customerContact: contact,
    });

    return { userId, quotationId, invoiceId, invoiceNumber, subtotal, vatAmount, total };
  },
});
