import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================
// BONRAM RENTALS - Convex Schema
// Institutional Luxury Event Equipment Portal
// ============================================

export default defineSchema({
  // ============================================
  // Authentication & Access Control
  // ============================================

  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk user identifier
    role: v.union(
      v.literal("admin"),
      v.literal("staff"),
      v.literal("customer")
    ),
    // Profile fields for invoicing
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  invitations: defineTable({
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    invitedBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // ============================================
  // Product Catalog
  // ============================================

  products: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(), // Sanitation, Structures, Power, Audio, Seating, Lighting, Transport, Catering
    dailyRate: v.number(),
    totalStock: v.number(),
    minGuests: v.optional(v.number()), // For smart recommendations
    maxGuests: v.optional(v.number()), // For smart recommendations
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()), // External URL fallback (e.g., Unsplash placeholders)
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // ============================================
  // Quotations (Core Engine)
  // ============================================

  quotations: defineTable({
    userId: v.optional(v.id("users")), // Optional for guest leads
    publicReference: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    specialRequests: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"), // Submitted by client
      v.literal("reviewing"), // Admin is reviewing
      v.literal("sent_to_client"), // Admin sent formal quote
      v.literal("confirmed"), // Client accepted
      v.literal("cancelled")
    ),

    // Event Details for Curated Logic
    eventDetails: v.object({
      location: v.string(),
      locationLat: v.optional(v.number()),
      locationLng: v.optional(v.number()),
      guestCount: v.number(),
      startDate: v.number(), // Unix timestamp
      endDate: v.number(), // Unix timestamp
      eventType: v.optional(v.string()),
    }),

    // Customer Contact Information
    customerContact: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      company: v.optional(v.string()),
      address: v.optional(v.string()),
      vatNumber: v.optional(v.string()),
    }),

    // Logistics & Admin
    logistics: v.optional(v.object({
      vendorNo: v.optional(v.string()),
      poNumber: v.optional(v.string()),
      grNumber: v.optional(v.string()),
      invoiceNumber: v.optional(v.string()), // Distinct from system invoice number if needed
    })),

    // Banking Details Override
    banking: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      branchCode: v.string(),
    })),

    // Pricing
    subtotal: v.number(),
    deliveryFee: v.optional(v.number()),
    discount: v.optional(v.number()),
    total: v.number(),

    // Admin Fields
    adminNotes: v.optional(v.string()), // Visible to client
    internalNotes: v.optional(v.string()), // Internal only

    createdAt: v.number(),
    updatedAt: v.number(),

    // Document Studio Fields
    templateStyle: v.optional(v.string()), // e.g. "bonram-financial", "modern-minimal"
    branding: v.optional(v.object({
      logoX: v.number(),
      logoY: v.number(),
      logoScale: v.number(),
      logoOpacity: v.number(),
      logoIsBack: v.boolean(),
      logoUrl: v.optional(v.string()),
    })),
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // ============================================
  // Quotation Line Items
  // ============================================

  quotationItems: defineTable({
    quotationId: v.id("quotations"),
    productId: v.optional(v.id("products")),
    description: v.string(), // Name/Description of the service or product
    uom: v.optional(v.string()), // Unit of Measure (e.g. "day", "unit", "set")
    quantity: v.number(),
    priceAtTime: v.number(), // Snapshot of rate when added
    lineTotal: v.number(),
  }).index("by_quotation", ["quotationId"]),

  // ============================================
  // Availability Tracking
  // ============================================

  bookings: defineTable({
    quotationId: v.id("quotations"),
    productId: v.id("products"),
    quantity: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("reserved"), // In quote, not confirmed
      v.literal("confirmed"), // Confirmed booking
      v.literal("returned"), // Equipment returned
      v.literal("cancelled") // Booking cancelled
    ),
  })
    .index("by_product", ["productId"])
    .index("by_quotation", ["quotationId"])
    .index("by_dates", ["startDate", "endDate"]),

  funnelEvents: defineTable({
    event: v.union(
      v.literal("planner_started"),
      v.literal("catalog_viewed"),
      v.literal("item_added"),
      v.literal("quote_started"),
      v.literal("quote_submitted"),
      v.literal("quote_failed"),
    ),
    source: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_event", ["event"]),

  // ============================================
  // Invoices
  // ============================================

  invoices: defineTable({
    quotationId: v.id("quotations"),
    invoiceNumber: v.string(),       // e.g. "INV-2026-001"
    docType: v.union(v.literal("invoice"), v.literal("quotation")),
    issuedDate: v.number(),
    dueDate: v.number(),
    subtotal: v.number(),
    vatAmount: v.number(),
    total: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid")
    ),
    createdAt: v.number(),

    // Customer Snapshot
    customerContact: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      company: v.optional(v.string()),
      address: v.optional(v.string()),
      vatNumber: v.optional(v.string()),
    }),

    // Logistics & Admin
    logistics: v.optional(v.object({
      vendorNo: v.optional(v.string()),
      poNumber: v.optional(v.string()),
      grNumber: v.optional(v.string()),
    })),

    // Banking Details Override
    banking: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      branchCode: v.string(),
    })),

    // Document Studio Fields
    templateStyle: v.optional(v.string()),
    branding: v.optional(v.object({
      logoX: v.number(),
      logoY: v.number(),
      logoScale: v.number(),
      logoOpacity: v.number(),
      logoIsBack: v.boolean(),
      logoUrl: v.optional(v.string()),
    })),
  })
    .index("by_quotation", ["quotationId"])
    .index("by_status", ["status"]),
});
