import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

// ============================================
// CARD COMPONENT
// Institutional Luxury Design System
// ============================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "bordered";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const baseStyles = "rounded-xl overflow-hidden";

    const variants = {
      default: "bg-white border border-gray-light",
      glass: "bg-white border border-gray-light",
      elevated: "bg-white border-2 border-navy",
      bordered: "bg-white border border-gray-light",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hover && "card-hover cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// ============================================
// CARD HEADER
// ============================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 border-b border-gray-light", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

// ============================================
// CARD BODY
// ============================================

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> { }

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
    );
  }
);

CardBody.displayName = "CardBody";

// ============================================
// CARD FOOTER
// ============================================

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4 border-t border-gray-light bg-mist/50",
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

// ============================================
// CARD IMAGE
// ============================================

export interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
}

const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, src, alt, aspectRatio = "video", ...props }, ref) => {
    const aspectRatios = {
      video: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
      auto: "",
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden bg-mist", aspectRatios[aspectRatio], className)}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }
);

CardImage.displayName = "CardImage";

export { Card, CardHeader, CardBody, CardFooter, CardImage };
