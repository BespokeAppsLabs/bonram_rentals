"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ============================================
// HERO SECTION COMPONENT
// Institutional Luxury Design
// ============================================

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const trackFunnelEvent = useMutation(api.analytics.trackFunnelEvent);

  const browseGear = () => {
    void trackFunnelEvent({ event: "planner_started", source: "homepage" });
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (location.trim()) params.set("location", location.trim());
    if (guestCount) params.set("guests", guestCount);
    const queryString = params.toString();
    window.location.href = `/catalog${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <section className={cn("relative min-h-[90vh] flex items-center justify-center", className)}>
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/products/double_trailer.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-navy/90" />

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
              startDate={startDate}
              endDate={endDate}
              location={location}
              guestCount={guestCount}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onLocationChange={setLocation}
              onGuestCountChange={(count) => setGuestCount(count ? String(count) : "")}
              onSubmit={browseGear}
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
  onLocationChange?: (location: string) => void;
  onGuestCountChange?: (count: number) => void;
  onSubmit?: () => void;
  startDate?: string;
  endDate?: string;
  location?: string;
  guestCount?: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
}

export function QuickStartBar({
  className,
  variant = "standalone",
  onLocationChange,
  onGuestCountChange,
  onSubmit,
  startDate = "",
  endDate = "",
  location = "",
  guestCount = "",
  onStartDateChange,
  onEndDateChange,
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
            <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              aria-label="Event start date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              className={cn(
                "w-full px-4 py-3 rounded-sm border focus:outline-none focus:border-gold transition-luxury",
                variant === "hero"
                  ? "bg-mist border-gray-light text-navy placeholder:text-gray"
                  : "bg-white border-gray-light text-charcoal placeholder:text-gray"
              )}
              onChange={(e) => onStartDateChange?.(e.target.value)}
            />
            <input
              type="date"
              aria-label="Event end date"
              value={endDate}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full px-2 py-3 rounded-sm border focus:outline-none focus:border-gold transition-luxury bg-mist border-gray-light text-navy"
              onChange={(e) => onEndDateChange?.(e.target.value)}
            />
            </div>
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
              value={location}
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
              value={guestCount}
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
