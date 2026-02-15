import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with initial products
 * Run this mutation once to populate the database
 * 
 * Usage: npx convex run seed:seedProducts
 */
export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existing = await ctx.db.query("products").first();
    if (existing) {
      return { message: "Products already seeded", count: 0 };
    }

    const products = [
      // ============================================
      // SANITATION
      // ============================================
      {
        name: "VIP Toilet Trailer",
        description: "Luxury mobile toilet trailer with 4 separate units, flushing toilets, running water, and vanity mirrors. Perfect for weddings and corporate events.",
        category: "Sanitation",
        dailyRate: 850,
        totalStock: 6,
        minGuests: 50,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1584820959030-49a0bb5219fc?w=800&h=600&fit=crop",
      },
      {
        name: "Standard Portable Toilet",
        description: "Clean, well-maintained portable toilet units. Ideal for construction sites or large outdoor events.",
        category: "Sanitation",
        dailyRate: 150,
        totalStock: 50,
        minGuests: 1,
        maxGuests: 100,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },
      {
        name: "Deluxe Portable Toilet",
        description: "Upgraded portable toilet with hand sanitizer dispenser, mirror, and improved ventilation.",
        category: "Sanitation",
        dailyRate: 250,
        totalStock: 20,
        minGuests: 30,
        maxGuests: 150,
        imageUrl: "https://images.unsplash.com/photo-1584820959030-49a0bb5219fc?w=800&h=600&fit=crop",
      },
      {
        name: "Hand Wash Station",
        description: "Portable hand wash station with foot pump operation. Holds 40L of fresh water.",
        category: "Sanitation",
        dailyRate: 200,
        totalStock: 15,
        minGuests: 50,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1584468709197-0fc1c4e1d9f0?w=800&h=600&fit=crop",
      },

      // ============================================
      // STRUCTURES (Tents & Stages)
      // ============================================
      {
        name: "White Event Tent (10x20m)",
        description: "Elegant white marquee tent suitable for weddings and formal events. Includes sidewalls.",
        category: "Structures",
        dailyRate: 3500,
        totalStock: 4,
        minGuests: 100,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1470229792924-9c9f86e7d6a3?w=800&h=600&fit=crop",
      },
      {
        name: "Medium Tent (6x12m)",
        description: "Versatile tent for medium-sized gatherings. Perfect for parties and corporate functions.",
        category: "Structures",
        dailyRate: 1800,
        totalStock: 8,
        minGuests: 40,
        maxGuests: 100,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "Small Tent (3x6m)",
        description: "Compact tent for small gatherings, food stalls, or registration areas.",
        category: "Structures",
        dailyRate: 800,
        totalStock: 12,
        minGuests: 1,
        maxGuests: 30,
        imageUrl: "https://images.unsplash.com/photo-1504280318855-cc63a2f683f2?w=800&h=600&fit=crop",
      },
      {
        name: "Stage Platform (2x4m)",
        description: "Modular stage platform with adjustable height. Ideal for speeches, bands, or presentations.",
        category: "Structures",
        dailyRate: 450,
        totalStock: 10,
        minGuests: 50,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb16133665?w=800&h=600&fit=crop",
      },
      {
        name: "Large Stage (4x8m)",
        description: "Professional stage setup with safety rails and stairs. Suitable for concerts and large events.",
        category: "Structures",
        dailyRate: 1200,
        totalStock: 3,
        minGuests: 150,
        maxGuests: 1000,
        imageUrl: "https://images.unsplash.com/photo-1501281668748-12a2c2b6d1a4?w=800&h=600&fit=crop",
      },

      // ============================================
      // POWER
      // ============================================
      {
        name: "MW8000D Generator",
        description: "Reliable 8kW silent generator. Perfect for events requiring moderate power.",
        category: "Power",
        dailyRate: 650,
        totalStock: 8,
        minGuests: 50,
        maxGuests: 150,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },
      {
        name: "Large Generator (15kW)",
        description: "Heavy-duty 15kW generator for large events. Silent operation with fuel-efficient engine.",
        category: "Power",
        dailyRate: 1200,
        totalStock: 5,
        minGuests: 150,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1621905252507-0ca1efc1e9a4?w=800&h=600&fit=crop",
      },
      {
        name: "Industrial Generator (30kW)",
        description: "High-capacity generator for major events and industrial applications.",
        category: "Power",
        dailyRate: 2500,
        totalStock: 3,
        minGuests: 300,
        maxGuests: 1000,
        imageUrl: "https://images.unsplash.com/photo-1621905252507-0ca1efc1e9a4?w=800&h=600&fit=crop",
      },
      {
        name: "Distribution Board",
        description: "Professional power distribution board with multiple outlets and circuit protection.",
        category: "Power",
        dailyRate: 150,
        totalStock: 15,
        minGuests: 50,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },

      // ============================================
      // AUDIO
      // ============================================
      {
        name: "Standard PA System",
        description: "Complete PA system with 2 speakers, mixer, and microphones. Coverage for up to 100 guests.",
        category: "Audio",
        dailyRate: 800,
        totalStock: 10,
        minGuests: 30,
        maxGuests: 100,
        imageUrl: "https://images.unsplash.com/photo-1470229792924-9c9f86e7d6a3?w=800&h=600&fit=crop",
      },
      {
        name: "XL Audio Package",
        description: "Professional sound system with 4 speakers, subwoofers, mixer, and wireless mics. Coverage for 200+ guests.",
        category: "Audio",
        dailyRate: 1500,
        totalStock: 5,
        minGuests: 100,
        maxGuests: 400,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb16133665?w=800&h=600&fit=crop",
      },
      {
        name: "Concert Sound System",
        description: "Full concert-grade sound system with line array speakers, monitors, and professional mixing desk.",
        category: "Audio",
        dailyRate: 4500,
        totalStock: 2,
        minGuests: 300,
        maxGuests: 1500,
        imageUrl: "https://images.unsplash.com/photo-1501281668748-12a2c2b6d1a4?w=800&h=600&fit=crop",
      },
      {
        name: "Wireless Microphone Set",
        description: "Set of 2 wireless handheld microphones with receiver. 50m range.",
        category: "Audio",
        dailyRate: 350,
        totalStock: 12,
        minGuests: 30,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1590506222345-7322b9b4a0e5?w=800&h=600&fit=crop",
      },

      // ============================================
      // SEATING
      // ============================================
      {
        name: "Plastic Chairs",
        description: "Stackable white plastic chairs. Comfortable and durable for all event types.",
        category: "Seating",
        dailyRate: 5,
        totalStock: 500,
        minGuests: 1,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "Tiffany Chairs",
        description: "Elegant chiavari chairs in gold or silver. Perfect for weddings and formal events.",
        category: "Seating",
        dailyRate: 25,
        totalStock: 200,
        minGuests: 30,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "Round Tables (1.8m)",
        description: "Standard round tables seating 8-10 guests. Includes table linen clips.",
        category: "Seating",
        dailyRate: 75,
        totalStock: 50,
        minGuests: 20,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "Rectangular Tables (1.8m)",
        description: "Versatile rectangular tables for seating or buffet service.",
        category: "Seating",
        dailyRate: 60,
        totalStock: 40,
        minGuests: 20,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "Cocktail Tables",
        description: "Standing cocktail tables with white tops. Perfect for networking events.",
        category: "Seating",
        dailyRate: 45,
        totalStock: 30,
        minGuests: 30,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },

      // ============================================
      // LIGHTING
      // ============================================
      {
        name: "Fairy Light Canopy",
        description: "Romantic fairy light strings for tent or ceiling decoration. 50m coverage.",
        category: "Lighting",
        dailyRate: 450,
        totalStock: 10,
        minGuests: 50,
        maxGuests: 300,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "LED Uplighters (Set of 8)",
        description: "RGB LED uplighters with remote control. Create ambient lighting for any venue.",
        category: "Lighting",
        dailyRate: 600,
        totalStock: 8,
        minGuests: 50,
        maxGuests: 300,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb16133665?w=800&h=600&fit=crop",
      },
      {
        name: "Stage Lighting Package",
        description: "Professional stage lighting with moving heads, spotlights, and controller.",
        category: "Lighting",
        dailyRate: 1800,
        totalStock: 4,
        minGuests: 100,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1501281668748-12a2c2b6d1a4?w=800&h=600&fit=crop",
      },
      {
        name: "Flood Lights",
        description: "High-powered LED flood lights for outdoor area lighting.",
        category: "Lighting",
        dailyRate: 200,
        totalStock: 20,
        minGuests: 50,
        maxGuests: 500,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb16133665?w=800&h=600&fit=crop",
      },

      // ============================================
      // COOLING & CLIMATE
      // ============================================
      {
        name: "Industrial Fan",
        description: "Large industrial fan for cooling tents and outdoor areas.",
        category: "Climate",
        dailyRate: 150,
        totalStock: 15,
        minGuests: 50,
        maxGuests: 300,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },
      {
        name: "Portable Air Conditioner",
        description: "Mobile AC unit for cooling tents and indoor spaces. 12000 BTU.",
        category: "Climate",
        dailyRate: 450,
        totalStock: 6,
        minGuests: 30,
        maxGuests: 100,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },

      // ============================================
      // CATERING EQUIPMENT
      // ============================================
      {
        name: "Gas Braai (BBQ)",
        description: "Professional gas braai for catering. Large cooking surface.",
        category: "Catering",
        dailyRate: 350,
        totalStock: 8,
        minGuests: 30,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },
      {
        name: "Chafing Dishes (Set of 4)",
        description: "Elegant chafing dishes with fuel holders for buffet service.",
        category: "Catering",
        dailyRate: 300,
        totalStock: 10,
        minGuests: 30,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1519162591786-fe1c3a1a564b?w=800&h=600&fit=crop",
      },
      {
        name: "Commercial Ice Machine",
        description: "High-capacity ice machine producing 50kg ice per day.",
        category: "Catering",
        dailyRate: 550,
        totalStock: 4,
        minGuests: 50,
        maxGuests: 300,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },
      {
        name: "Beverage Cooler",
        description: "Large beverage cooler/dispenser for drinks. Holds 50L.",
        category: "Catering",
        dailyRate: 200,
        totalStock: 10,
        minGuests: 30,
        maxGuests: 200,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25cab85b0?w=800&h=600&fit=crop",
      },
    ];

    // Insert all products
    const now = Date.now();
    let count = 0;
    for (const product of products) {
      await ctx.db.insert("products", {
        ...product,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      });
      count++;
    }

    return { message: "Products seeded successfully", count };
  },
});

/**
 * Clear all products from the database
 * Use with caution!
 * 
 * Usage: npx convex run seed:clearProducts
 */
export const clearProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    for (const product of products) {
      await ctx.db.delete(product._id);
    }

    return { message: "Products cleared", count: products.length };
  },
});

/**
 * Seed the initial super admin user
 * Run once: npx convex run seed:seedAdmin
 * 
 * NOTE: Password "AdminBespoke2026!" must be configured in WorkOS AuthKit
 */
export const seedAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const email = "lucas@bonram.co.za";
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      if (existing.role !== "admin") {
        await ctx.db.patch(existing._id, { role: "admin" });
      }
      return { message: "Admin user already exists and is updated to admin role", userId: existing._id };
    }

    const userId = await ctx.db.insert("users", {
      name: "Lucas",
      email: email,
      tokenIdentifier: "pending", // Will be updated on first login by UserSync
      role: "admin",
      createdAt: Date.now(),
    });

    return { message: "Admin user seeded", userId };
  },
});

