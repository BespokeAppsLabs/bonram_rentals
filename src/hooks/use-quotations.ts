"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ============================================
// QUOTATIONS HOOKS
// React hooks for Convex quotation operations
// ============================================

/**
 * Hook to fetch all quotations (Admin)
 */
export function useQuotations() {
  const quotations = useQuery(api.quotations.getAll);
  return {
    quotations,
    isLoading: quotations === undefined,
  };
}

/**
 * Hook to fetch quotations by status (for Kanban)
 */
export function useQuotationsByStatus(status: string) {
  const quotations = useQuery(api.quotations.getByStatus, { status });
  return {
    quotations,
    isLoading: quotations === undefined,
  };
}

/**
 * Hook to fetch a single quotation with items
 */
export function useQuotation(id: Id<"quotations"> | null) {
  const data = useQuery(
    api.quotations.getById,
    id ? { id } : "skip"
  );
  return {
    quotation: data ?? null,
    items: data?.items ?? [],
    isLoading: id !== null && data === undefined,
  };
}

/**
 * Hook to create a new quotation
 */
export function useCreateQuotation() {
  const createQuotation = useMutation(api.quotations.create);
  return { createQuotation };
}

/**
 * Hook to add item to quotation
 */
export function useAddQuotationItem() {
  const addItem = useMutation(api.quotations.addItem);
  return { addItem };
}

/**
 * Hook to remove item from quotation
 */
export function useRemoveQuotationItem() {
  const removeItem = useMutation(api.quotations.removeItem);
  return { removeItem };
}

/**
 * Hook to update item quantity
 */
export function useUpdateItemQuantity() {
  const updateQuantity = useMutation(api.quotations.updateItemQuantity);
  return { updateQuantity };
}

/**
 * Hook to update quotation status
 */
export function useUpdateQuotationStatus() {
  const updateStatus = useMutation(api.quotations.updateStatus);
  return { updateStatus };
}

/**
 * Hook to submit quotation for review
 */
export function useSubmitForReview() {
  const submitForReview = useMutation(api.quotations.submitForReview);
  return { submitForReview };
}

/**
 * Hook to update quotation pricing (Admin)
 */
export function useUpdateQuotationPricing() {
  const updatePricing = useMutation(api.quotations.updatePricing);
  return { updatePricing };
}

/**
 * Hook to update event details
 */
export function useUpdateEventDetails() {
  const updateEventDetails = useMutation(api.quotations.updateEventDetails);
  return { updateEventDetails };
}
