import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// ============================================
// BADGE COMPONENT
// Institutional Luxury Design System
// ============================================

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center font-medium rounded-full
    transition-colors duration-200
  `;

  const variants = {
    default: "bg-navy/10 text-navy",
    gold: "bg-gold/20 text-gold-dark",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
    outline: "border border-navy text-navy",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================
// STATUS BADGE
// ============================================

export type StatusType = 
  | "draft"
  | "pending_review"
  | "reviewing"
  | "sent_to_client"
  | "confirmed"
  | "cancelled";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
}

const STATUS_CONFIG: Record<StatusType, { label: string; variant: BadgeProps["variant"] }> = {
  draft: { label: "Draft", variant: "default" },
  pending_review: { label: "New Request", variant: "warning" },
  reviewing: { label: "Reviewing", variant: "info" },
  sent_to_client: { label: "Sent to Client", variant: "gold" },
  confirmed: { label: "Confirmed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
}

// ============================================
// PRODUCT BADGE
// ============================================

export type ProductBadgeType = "popular" | "premium" | "essential" | "new";

export interface ProductBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type: ProductBadgeType;
}

const PRODUCT_BADGE_CONFIG: Record<ProductBadgeType, { label: string; variant: BadgeProps["variant"] }> = {
  popular: { label: "★ Popular", variant: "gold" },
  premium: { label: "Premium", variant: "gold" },
  essential: { label: "Essential", variant: "info" },
  new: { label: "New", variant: "success" },
};

export function ProductBadge({ type, className, ...props }: ProductBadgeProps) {
  const config = PRODUCT_BADGE_CONFIG[type];
  
  return (
    <Badge variant={config.variant} size="sm" className={className} {...props}>
      {config.label}
    </Badge>
  );
}
