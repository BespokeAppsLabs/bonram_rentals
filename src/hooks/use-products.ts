"use client";

import { useQuery, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const LOAD_TIMEOUT_MS = 8000;

function useLoadTimeout(isLoading: boolean) {
  const [timedOut, setTimedOut] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading && !timedOut) {
      timer.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    } else {
      if (timer.current) clearTimeout(timer.current);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [isLoading, timedOut]);

  return timedOut && isLoading;
}

export function useProducts() {
  const products = useQuery(api.products.getAll);
  const isLoading = products === undefined;
  const timedOut = useLoadTimeout(isLoading);
  return {
    products: timedOut ? [] : products,
    isLoading: isLoading && !timedOut,
    error: timedOut ? "Unable to load products. Check your connection and try again." : null,
  };
}

export function useProductsWithAvailability(startDate: number | null, endDate: number | null) {
  const products = useQuery(
    api.recommendations.getProductsWithAvailability,
    startDate !== null && endDate !== null ? { startDate, endDate } : "skip",
  );
  const isLoading = startDate !== null && endDate !== null && products === undefined;
  const timedOut = useLoadTimeout(isLoading);
  return {
    products: timedOut ? [] : products,
    isLoading: isLoading && !timedOut,
    error: timedOut ? "Unable to check availability. Try again." : null,
  };
}

export function useProductsByCategory(category: string) {
  const products = useQuery(api.products.getByCategory, { category });
  const isLoading = products === undefined;
  const timedOut = useLoadTimeout(isLoading);
  return {
    products: timedOut ? [] : products,
    isLoading: isLoading && !timedOut,
    error: timedOut ? "Unable to load products. Check your connection and try again." : null,
  };
}

export function useProduct(id: Id<"products"> | null) {
  const product = useQuery(api.products.getById, id ? { id } : "skip");
  const isLoading = id !== null && product === undefined;
  const timedOut = useLoadTimeout(isLoading);
  return {
    product: timedOut ? null : product,
    isLoading: isLoading && !timedOut,
    error: timedOut ? "Unable to load product. Check your connection and try again." : null,
  };
}

export function useProductsByGuestCount(guestCount: number | null) {
  const products = useQuery(
    api.products.getByGuestCount,
    guestCount !== null ? { guestCount } : "skip"
  );
  const isLoading = guestCount !== null && products === undefined;
  const timedOut = useLoadTimeout(isLoading);
  return {
    products: timedOut ? [] : products,
    isLoading: isLoading && !timedOut,
    error: timedOut ? "Unable to load products. Check your connection and try again." : null,
  };
}

export function useCategories() {
  const categories = useQuery(api.products.getCategories);
  const isLoading = categories === undefined;
  const timedOut = useLoadTimeout(isLoading);
  return {
    categories: timedOut ? [] : (categories ?? []),
    isLoading: isLoading && !timedOut,
    error: timedOut ? "Unable to load categories." : null,
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
