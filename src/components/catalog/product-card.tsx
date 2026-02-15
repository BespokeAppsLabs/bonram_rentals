"use client";

import { cn } from "@/lib/utils";
import { Card, CardBody, Badge, Button } from "@/components/ui";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

// ============================================
// PRODUCT CARD COMPONENT
// Equipment Gallery - Spacious Grid Layout
// ============================================

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  dailyRate: number;
  totalStock: number;
  minGuests?: number;
  maxGuests?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  availableQuantity?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToQuote?: (productId: string, quantity: number) => void;
  className?: string;
}

export function ProductCard({ product, onAddToQuote, className }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    const maxQty = product.availableQuantity ?? product.totalStock;
    if (quantity < maxQty) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToQuote = () => {
    if (quantity > 0 && onAddToQuote) {
      onAddToQuote(product._id, quantity);
      setQuantity(0);
    }
  };

  // Determine badge
  const getBadge = () => {
    if (product.minGuests && product.minGuests >= 100) {
      return { type: "popular", label: "Popular for 100+ Guests" };
    }
    if (product.category === "Structures" && product.dailyRate > 2000) {
      return { type: "premium", label: "Premium" };
    }
    if (product.category === "Power") {
      return { type: "essential", label: "Essential for Outdoor" };
    }
    return null;
  };

  const badge = getBadge();
  const isAvailable = product.isAvailable !== false;

  return (
    <Card
      hover
      className={cn(
        "group flex flex-col",
        !isAvailable && "opacity-60",
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-mist overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-mist flex items-center justify-center">
            <span className="text-navy text-sm">No image</span>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <Badge
            variant="gold"
            className="absolute top-3 left-3"
          >
            {badge.label}
          </Badge>
        )}

        {/* Availability Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-navy flex items-center justify-center">
            <span className="text-white font-semibold">Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardBody className="flex-1 flex flex-col">
        <p className="text-sm text-gold font-medium mb-1">{product.category}</p>
        <h3 className="text-lg font-heading font-semibold text-navy mb-1">{product.name}</h3>
        <p className="text-gray text-sm mb-3 line-clamp-2 flex-1">{product.description}</p>



        {/* Quantity Selector & Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-light rounded-lg">
            <button
              onClick={handleDecrement}
              disabled={quantity === 0 || !isAvailable}
              className="p-2 text-charcoal hover:text-navy hover:bg-mist transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-semibold text-navy">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={!isAvailable || quantity >= (product.availableQuantity ?? product.totalStock)}
              className="p-2 text-charcoal hover:text-navy hover:bg-mist transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant={quantity > 0 ? "gold" : "secondary"}
            size="md"
            className="flex-1"
            onClick={handleAddToQuote}
            disabled={quantity === 0 || !isAvailable}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Quote
          </Button>
        </div>

        {/* Stock Info */}
        {isAvailable && (
          <p className="text-xs text-gray mt-2">
            {product.availableQuantity ?? product.totalStock} available
          </p>
        )}
      </CardBody>
    </Card>
  );
}

export default ProductCard;
