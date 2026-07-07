import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth.helpers";

// ============================================
// PRODUCT QUERIES
// ============================================

/**
 * Get all active products
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

/**
 * Get all active products with storage image URLs resolved
 */
export const getAllWithImages = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();

    return Promise.all(
      products.map(async (product) => {
        if (product.imageStorageId) {
          const url = await ctx.storage.getUrl(product.imageStorageId);
          return { ...product, imageUrl: url ?? product.imageUrl };
        }
        return product;
      })
    );
  },
});

/**
 * Get ALL products including inactive (admin only)
 */
export const getAllIncludingInactive = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("products").order("desc").collect();
  },
});

/**
 * Get products by category
 */
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get a single product by ID
 */
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get products suitable for a specific guest count
 */
export const getByGuestCount = query({
  args: { guestCount: v.number() },
  handler: async (ctx, args) => {
    const allProducts = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return allProducts.filter((product) => {
      const minGuests = product.minGuests ?? 0;
      const maxGuests = product.maxGuests ?? Infinity;
      return args.guestCount >= minGuests && args.guestCount <= maxGuests;
    });
  },
});

/**
 * Get all unique categories
 */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const categories = [...new Set(products.map((p) => p.category))];
    return categories.sort();
  },
});

// ============================================
// PRODUCT MUTATIONS (Admin Only)
// ============================================

/**
 * Create a new product
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    dailyRate: v.number(),
    totalStock: v.number(),
    minGuests: v.optional(v.number()),
    maxGuests: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing product
 */
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    dailyRate: v.optional(v.number()),
    totalStock: v.optional(v.number()),
    minGuests: v.optional(v.number()),
    maxGuests: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Product not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Soft delete a product
 */
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Upload product image
 */
export const setImage = mutation({
  args: {
    id: v.id("products"),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      imageStorageId: args.imageStorageId,
      updatedAt: Date.now(),
    });
  },
});
