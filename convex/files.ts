import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth.helpers";

// ============================================
// FILE STORAGE - Image Upload & Retrieval
// ============================================

/**
 * Generate a upload URL for client-side file uploads
 * Use this to get a URL for uploading files to Convex storage
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // This will return a URL that the client can use to upload a file
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a signed URL for displaying a stored file
 * Pass the storageId from a product's imageStorageId field
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.storage.delete(args.storageId);
  },
});

/**
 * Get all files in storage (admin utility)
 */
export const listFiles = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Note: Convex doesn't have a direct list method
    // This would typically be done via a separate tracking table
    // For now, return empty as we track images via product.imageStorageId
    return [];
  },
});
