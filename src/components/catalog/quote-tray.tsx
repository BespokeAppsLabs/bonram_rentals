"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

import { ShoppingCart, ChevronUp, ChevronDown, ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";

// ============================================
// QUOTE TRAY COMPONENT
// Sticky bottom bar showing quote summary
// ============================================

interface QuoteItem {
  productId: string;
  productName: string;
  dailyRate: number;
  quantity: number;
}

interface QuoteTrayProps {
  items: QuoteItem[];
  guestCount?: number;
  onReviewQuote?: () => void;
  onRemoveItem?: (productId: string) => void;
  className?: string;
}

export function QuoteTray({
  items,
  guestCount,
  onReviewQuote,
  onRemoveItem,
  className
}: QuoteTrayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);


  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 bg-navy shadow-2xl transition-all duration-300",
      isExpanded ? "h-auto" : "h-auto",
      className
    )}>
      {/* Main Bar */}
      <div
        className="container mx-auto px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-navy" />
          </div>
          <div>
            <p className="text-white font-semibold">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} Selected
            </p>
            {guestCount && (
              <p className="text-white/70 text-sm">
                Est. for {guestCount} guests
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="gold"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onReviewQuote?.();
            }}
          >
            Review Quote
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-white/70" />
          ) : (
            <ChevronUp className="w-5 h-5 text-white/70" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="container mx-auto px-4 py-4 border-t border-white/10">
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{item.productName}</p>
                  <p className="text-white/60 text-sm">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onRemoveItem?.(item.productId)}
                    className="p-1 text-white/50 hover:text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteTray;
