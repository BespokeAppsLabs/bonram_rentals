import { query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// SMART RECOMMENDATION ENGINE
// MVP: Guest Count-Based Recommendations
// ============================================

// Category priority for recommendations
const CATEGORY_PRIORITY: Record<string, number> = {
  "Sanitation": 1,
  "Power": 2,
  "Audio": 3,
  "Structures": 4,
  "Seating": 5,
  "Lighting": 6,
  "Transport": 7,
  "Catering": 8,
};

// Recommendation message templates by category
const RECOMMENDATION_MESSAGES: Record<string, string> = {
  "Sanitation": "Events with {guestCount}+ guests typically need additional sanitation facilities.",
  "Power": "Power demand increases with event size. Consider this for reliable coverage.",
  "Audio": "Ensure all guests can hear clearly with equipment suitable for {guestCount}+ guests.",
  "Structures": "Weather protection is essential for outdoor events of this size.",
  "Seating": "Ensure adequate seating capacity for your guest count.",
  "Lighting": "Create the right ambiance with appropriate lighting for your event.",
  "Transport": "Guest transportation may be needed for larger events.",
  "Catering": "Catering support equipment ensures smooth food service.",
};

/**
 * Get smart recommendations based on guest count
 */
export const getRecommendations = query({
  args: {
    guestCount: v.number(),
    existingProductIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    // Get all active products
    const allProducts = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter out already selected products
    const availableProducts = allProducts.filter(
      (p) => !args.existingProductIds.includes(p._id)
    );

    // Filter products suitable for guest count
    const recommendations = availableProducts
      .filter((product) => {
        const minGuests = product.minGuests ?? 0;
        const maxGuests = product.maxGuests ?? Infinity;
        return args.guestCount >= minGuests && args.guestCount <= maxGuests;
      })
      .map((product) => {
        // Generate recommendation message
        const template = RECOMMENDATION_MESSAGES[product.category] || 
          "Recommended for your event size.";
        const message = template.replace("{guestCount}", String(args.guestCount));

        return {
          product,
          reason: message,
          priority: CATEGORY_PRIORITY[product.category] ?? 99,
        };
      })
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3); // Return top 3 recommendations

    return recommendations;
  },
});

/**
 * Get availability for a product on specific dates
 */
export const checkAvailability = query({
  args: {
    productId: v.id("products"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get product stock
    const product = await ctx.db.get(args.productId);
    if (!product) return { available: false, availableQuantity: 0 };

    // Get all bookings for this product in the date range
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => 
        q.and(
          q.gte(q.field("endDate"), args.startDate),
          q.lte(q.field("startDate"), args.endDate),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    // Calculate booked quantity
    const bookedQuantity = bookings.reduce(
      (sum, booking) => sum + booking.quantity,
      0
    );

    const availableQuantity = Math.max(0, product.totalStock - bookedQuantity);

    return {
      available: availableQuantity > 0,
      availableQuantity,
      totalStock: product.totalStock,
      bookedQuantity,
    };
  },
});

/**
 * Get all products with availability for date range
 */
export const getProductsWithAvailability = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const productsWithAvailability = await Promise.all(
      products.map(async (product) => {
        const bookings = await ctx.db
          .query("bookings")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .filter((q) =>
            q.and(
              q.gte(q.field("endDate"), args.startDate),
              q.lte(q.field("startDate"), args.endDate),
              q.neq(q.field("status"), "cancelled")
            )
          )
          .collect();

        const bookedQuantity = bookings.reduce(
          (sum, booking) => sum + booking.quantity,
          0
        );
        const availableQuantity = Math.max(0, product.totalStock - bookedQuantity);

        return {
          ...product,
          availableQuantity,
          isAvailable: availableQuantity > 0,
        };
      })
    );

    return productsWithAvailability;
  },
});
