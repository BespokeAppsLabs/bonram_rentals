"use client";

import { cn } from "@/lib/utils";
import { Card, CardBody, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Lightbulb, Plus, X } from "lucide-react";

// ============================================
// PRO SUGGESTIONS COMPONENT
// Smart Recommendations Panel
// ============================================

interface SuggestionProduct {
  _id: string;
  name: string;
  category: string;
  dailyRate: number;
}

interface Suggestion {
  product: SuggestionProduct;
  reason: string;
  priority: number;
}

interface ProSuggestionsProps {
  suggestions: Suggestion[];
  guestCount: number;
  onAddToQuote?: (productId: string) => void;
  onDismiss?: (productId: string) => void;
  className?: string;
}

export function ProSuggestions({
  suggestions,
  guestCount,
  onAddToQuote,
  onDismiss,
  className,
}: ProSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-gold" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-navy">
          Pro Suggestions
        </h3>
      </div>

      <p className="text-gray text-sm mb-4">
        Based on your event size ({guestCount} guests), we recommend:
      </p>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.product._id}
            suggestion={suggestion}
            onAddToQuote={onAddToQuote}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// SUGGESTION CARD
// ============================================

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAddToQuote?: (productId: string) => void;
  onDismiss?: (productId: string) => void;
}

function SuggestionCard({ suggestion, onAddToQuote, onDismiss }: SuggestionCardProps) {
  const { product, reason } = suggestion;

  return (
    <Card variant="bordered" className="relative">
      <CardBody className="py-4">
        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss?.(product._id)}
          className="absolute top-2 right-2 p-1 text-gray hover:text-charcoal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category Badge */}
        <Badge variant="default" size="sm" className="mb-2">
          {product.category}
        </Badge>

        {/* Product Name */}
        <h4 className="font-semibold text-navy mb-1">{product.name}</h4>

        {/* Reason */}
        <p className="text-gray text-sm mb-3">{reason}</p>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-navy">
            {formatCurrency(product.dailyRate)}
            <span className="text-gray font-normal text-sm">/day</span>
          </span>
          <Button
            variant="gold"
            size="sm"
            onClick={() => onAddToQuote?.(product._id)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add to Quote
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default ProSuggestions;
