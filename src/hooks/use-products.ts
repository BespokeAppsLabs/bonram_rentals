"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ============================================
// PRODUCTS HOOKS
// React hooks for Convex product operations
// ============================================

/**
 * Hook to fetch all active products
 */
export function useProducts() {
  const products = useQuery(api.products.getAll);
  return {
    products,
    isLoading: products === undefined,
    error: null,
  };
}

/**
 * Hook to fetch products by category
 */
export function useProductsByCategory(category: string) {
  const products = useQuery(api.products.getByCategory, { category });
  return {
    products,
    isLoading: products === undefined,
    error: null,
  };
}

/**
 * Hook to fetch a single product
 */
export function useProduct(id: Id<"products"> | null) {
  const product = useQuery(
    api.products.getById,
    id ? { id } : "skip"
  );
  return {
    product,
    isLoading: id !== null && product === undefined,
    error: null,
  };
}

/**
 * Hook to fetch products suitable for a guest count
 */
export function useProductsByGuestCount(guestCount: number | null) {
  const products = useQuery(
    api.products.getByGuestCount,
    guestCount !== null ? { guestCount } : "skip"
  );
  return {
    products,
    isLoading: guestCount !== null && products === undefined,
    error: null,
  };
}

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  const categories = useQuery(api.products.getCategories);
  return {
    categories: categories ?? [],
    isLoading: categories === undefined,
  };
}

/**
 * Hook to create a product (Admin)
 */
export function useCreateProduct() {
  const createProduct = useMutation(api.products.create);
  return { createProduct };
}

/**
 * Hook to update a product (Admin)
 */
export function useUpdateProduct() {
  const updateProduct = useMutation(api.products.update);
  return { updateProduct };
}

/**
 * Hook to delete a product (Admin)
 */
export function useDeleteProduct() {
  const deleteProduct = useMutation(api.products.remove);
  return { deleteProduct };
}
