import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const protectedProducts = new Set([
  "Gas Braai (BBQ)",
  "Stage Lighting Package",
  "VIP Toilet Trailer",
  "Standard Portable Toilet",
]);

async function getUniqueProductByName(
  ctx: MutationCtx,
  name: string,
) {
  const matches = (await ctx.db.query("products").collect()).filter(
    (product) => product.name === name,
  );
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one product named "${name}", found ${matches.length}`);
  }
  return matches[0];
}

export const audit = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.map((product) => ({
      id: product._id,
      name: product.name,
      protected: protectedProducts.has(product.name),
      imageStorageId: product.imageStorageId,
      imageUrl: product.imageUrl,
      updatedAt: product.updatedAt,
    }));
  },
});

export const prepareUpload = internalMutation({
  args: { productName: v.string() },
  handler: async (ctx, args) => {
    if (protectedProducts.has(args.productName)) {
      throw new Error(`Protected product image cannot be replaced: ${args.productName}`);
    }
    const product = await getUniqueProductByName(ctx, args.productName);
    return {
      productId: product._id,
      expectedUpdatedAt: product.updatedAt,
      previousImageStorageId: product.imageStorageId,
      previousImageUrl: product.imageUrl,
      uploadUrl: await ctx.storage.generateUploadUrl(),
    };
  },
});

export const setGeneratedImage = internalMutation({
  args: {
    productId: v.id("products"),
    productName: v.string(),
    expectedUpdatedAt: v.number(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    if (protectedProducts.has(args.productName)) {
      throw new Error(`Protected product image cannot be replaced: ${args.productName}`);
    }
    const product = await ctx.db.get(args.productId);
    if (!product || product.name !== args.productName) {
      throw new Error(`Product identity changed before image update: ${args.productName}`);
    }
    if (product.updatedAt !== args.expectedUpdatedAt) {
      throw new Error(`Product changed during image upload: ${args.productName}`);
    }
    await ctx.db.patch(product._id, {
      imageStorageId: args.imageStorageId,
      imageUrl: undefined,
      updatedAt: Date.now(),
    });
    return { productId: product._id, imageStorageId: args.imageStorageId };
  },
});
