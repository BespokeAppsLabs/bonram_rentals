"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

// ============================================
// HERO SECTION COMPONENT
// Institutional Luxury Design
// ============================================

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn("relative min-h-[90vh] flex items-center justify-center", className)}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/hero-bg.jpg')`,
          }}
        />
        {/* Solid Navy Background - No Image Transparency */}
        <div className="absolute inset-0 bg-navy" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-white mb-6 animate-slide-up">
            Professional Equipment for{" "}
            <span className="text-gold">Unforgettable Events</span>
          </h1>

          {/* Subheadline - Solid Mist */}
          <p className="text-lg md:text-xl text-mist mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Presidential-grade service trusted by South Africa's biggest institutions.
            From intimate gatherings to large-scale functions.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <TrustIndicator label="Trusted by Eskom" />
            <TrustIndicator label="Government Approved" />
            <TrustIndicator label="Since 2013" />
          </div>

          {/* Integrated Quick Start Bar */}
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <QuickStartBar
              variant="hero"
              onSubmit={() => {
                window.location.href = "/catalog";
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}

// ============================================
// TRUST INDICATOR
// ============================================

function TrustIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-mist">
      <div className="w-2 h-2 bg-gold rounded-full" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

// ============================================
// QUICK START BAR
// ============================================

interface QuickStartBarProps {
  className?: string;
  onDateChange?: (dates: { startDate: Date | null; endDate: Date | null }) => void;
  onLocationChange?: (location: string) => void;
  onGuestCountChange?: (count: number) => void;
  onSubmit?: () => void;
}

export function QuickStartBar({
  className,
  variant = "standalone",
  onDateChange,
  onLocationChange,
  onGuestCountChange,
  onSubmit,
}: QuickStartBarProps & { variant?: "standalone" | "hero" }) {
  return (
    <div className={cn(
      variant === "standalone" ? "relative z-20 -mt-24 mx-4 md:mx-auto max-w-4xl" : "max-w-4xl mx-auto",
      className
    )}>
      <div className={cn(
        "rounded-sm shadow-none transition-luxury",
        variant === "hero" ? "bg-white p-6 border-b-2 border-gold" : "bg-white p-6 md:p-8 border border-gray-light"
      )}>
        <h2 className={cn(
          "text-xl font-heading font-bold mb-6 text-center",
          variant === "hero" ? "text-navy" : "text-navy"
        )}>
          Start Planning Your Event
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className={cn(
              "block text-sm font-medium mb-2",
              variant === "hero" ? "text-navy" : "text-charcoal"
            )}>
              <Calendar className="inline w-4 h-4 mr-1 text-gold" />
              Event Dates
            </label>
            <input
              type="text"
              placeholder="Select dates"
              className={cn(
                "w-full px-4 py-3 rounded-sm border focus:outline-none focus:border-gold transition-luxury",
                variant === "hero"
                  ? "bg-mist border-gray-light text-navy placeholder:text-gray"
                  : "bg-white border-gray-light text-charcoal placeholder:text-gray"
              )}
              onChange={(e) => {
                console.log("Date change:", e.target.value);
              }}
            />
          </div>

          <div className="relative">
            <label className={cn(
              "block text-sm font-medium mb-2",
              variant === "hero" ? "text-navy" : "text-charcoal"
            )}>
              <MapPin className="inline w-4 h-4 mr-1 text-gold" />
              Location
            </label>
            <input
              type="text"
              placeholder="Location"
              className={cn(
                "w-full px-4 py-3 rounded-sm border focus:outline-none focus:border-gold transition-luxury",
                variant === "hero"
                  ? "bg-mist border-gray-light text-navy placeholder:text-gray"
                  : "bg-white border-gray-light text-charcoal placeholder:text-gray"
              )}
              onChange={(e) => onLocationChange?.(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className={cn(
              "block text-sm font-medium mb-2",
              variant === "hero" ? "text-navy" : "text-charcoal"
            )}>
              <Users className="inline w-4 h-4 mr-1 text-gold" />
              Guest Count
            </label>
            <input
              type="number"
              placeholder="Guests"
              min="1"
              className={cn(
                "w-full px-4 py-3 rounded-sm border focus:outline-none focus:border-gold transition-luxury",
                variant === "hero"
                  ? "bg-mist border-gray-light text-navy placeholder:text-gray"
                  : "bg-white border-gray-light text-charcoal placeholder:text-gray"
              )}
              onChange={(e) => onGuestCountChange?.(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <Button
              variant="gold"
              size="lg"
              className="w-full h-[50px] font-bold"
              onClick={onSubmit}
            >
              Browse Gear
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
