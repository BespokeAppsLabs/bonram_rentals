"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProSuggestions } from "@/components/quote/pro-suggestions";
import { Button, Input, Card, CardBody, Badge } from "@/components/ui";
import { formatCurrency, formatDateRange, calculateDays } from "@/lib/utils";
import { useProducts } from "@/hooks/use-products";
import { useCreateQuotation, useAddQuotationItem } from "@/hooks/use-quotations";
import {
  MapPin,
  Users,
  Calendar,
  Edit2,
  Minus,
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  CheckCircle,
  Loader2
} from "lucide-react";

// ============================================
// QUOTATION PAGE
// Two-Column Layout with Smart Suggestions
// Connected to Convex Database
// ============================================

interface QuoteItem {
  productId: string;
  productName: string;
  category: string;
  dailyRate: number;
  quantity: number;
}

export default function QuotePage() {
  // Fetch products from Convex
  const { products, isLoading: productsLoading } = useProducts();
  const { createQuotation } = useCreateQuotation();
  const { addItem } = useAddQuotationItem();

  // Event details state
  const [eventDetails, setEventDetails] = useState({
    location: "",
    guestCount: 100,
    startDate: Date.now(),
    endDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days later
    eventType: "wedding",
  });

  // Customer contact state
  const [customerContact, setCustomerContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  // Quote items state - loaded from sessionStorage
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  // Dismissed suggestions
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  // Edit mode
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load quote items from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("quoteItems");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setQuoteItems(parsed);
        sessionStorage.removeItem("quoteItems");
      } catch (e) {
        console.error("Failed to parse quote items:", e);
      }
    }
  }, []);

  // Calculate days
  const days = calculateDays(eventDetails.startDate, eventDetails.endDate);

  // Calculate totals
  const subtotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + (item.dailyRate * item.quantity * days), 0);
  }, [quoteItems, days]);

  // Get recommendations based on guest count
  const recommendations = useMemo(() => {
    if (!products) return [];

    return products
      .filter((p) => {
        // Filter out already selected items
        if (quoteItems.find((item) => item.productId === p._id)) return false;
        // Filter out dismissed
        if (dismissedSuggestions.includes(p._id)) return false;
        // Filter by guest count
        const minGuests = p.minGuests ?? 0;
        const maxGuests = p.maxGuests ?? Infinity;
        return eventDetails.guestCount >= minGuests && eventDetails.guestCount <= maxGuests;
      })
      .slice(0, 3)
      .map((p) => ({
        product: {
          _id: p._id,
          name: p.name,
          category: p.category,
          dailyRate: p.dailyRate,
        },
        reason: getRecommendationReason(p.category, eventDetails.guestCount),
        priority: 1,
      }));
  }, [products, quoteItems, dismissedSuggestions, eventDetails.guestCount]);

  // Update quantity
  const updateQuantity = (productId: string, delta: number) => {
    setQuoteItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return newQty === 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as QuoteItem[]
    );
  };

  // Remove item
  const removeItem = (productId: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Add suggestion to quote
  const addSuggestion = (productId: string) => {
    const product = products?.find((p) => p._id === productId);
    if (!product) return;

    if (!quoteItems.find((item) => item.productId === productId)) {
      setQuoteItems((prev) => [
        ...prev,
        {
          productId,
          productName: product.name,
          category: product.category,
          dailyRate: product.dailyRate,
          quantity: 1,
        },
      ]);
    }
    setDismissedSuggestions((prev) => [...prev, productId]);
  };

  // Dismiss suggestion
  const dismissSuggestion = (productId: string) => {
    setDismissedSuggestions((prev) => [...prev, productId]);
  };

  // Submit quote
  const handleSubmit = async () => {
    if (quoteItems.length === 0) return;

    setIsSubmitting(true);
    try {
      // Create quotation in Convex
      const quotationId = await createQuotation({
        eventDetails: {
          location: eventDetails.location,
          guestCount: eventDetails.guestCount,
          startDate: eventDetails.startDate,
          endDate: eventDetails.endDate,
          eventType: eventDetails.eventType,
        },
        customerContact: {
          name: customerContact.name,
          email: customerContact.email,
          phone: customerContact.phone,
          company: customerContact.company || undefined,
        },
      });

      // Add items to quotation
      for (const item of quoteItems) {
        await addItem({
          quotationId,
          productId: item.productId as any,
          quantity: item.quantity,
          description: item.productName,
          priceAtTime: item.dailyRate,
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quote:", error);
      alert("Failed to submit quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (productsLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-navy mx-auto mb-4" />
            <p className="text-gray">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardBody className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-navy mb-2">
                Quote Submitted!
              </h2>
              <p className="text-gray mb-6">
                Our team will review your request and get back to you within 4 hours.
              </p>
              <Button variant="gold" onClick={() => window.location.href = "/"}>
                Return Home
              </Button>
            </CardBody>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-mist">
        {/* Page Header */}
        <div className="bg-navy py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <a
                href="/catalog"
                className="text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
                  Your Quote Request
                </h1>
                <p className="text-white/70 text-sm">
                  Review your selections and submit for review
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Event Details & Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Specifications */}
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-heading font-semibold text-navy">
                      Event Specifications
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingEvent(!isEditingEvent)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  {isEditingEvent ? (
                    <div className="grid gap-4">
                      <Input
                        label="Location"
                        value={eventDetails.location}
                        onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                        placeholder="Where's the magic happening?"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Start Date"
                          type="date"
                          value={new Date(eventDetails.startDate).toISOString().split("T")[0]}
                          onChange={(e) => setEventDetails({ ...eventDetails, startDate: new Date(e.target.value).getTime() })}
                        />
                        <Input
                          label="End Date"
                          type="date"
                          value={new Date(eventDetails.endDate).toISOString().split("T")[0]}
                          onChange={(e) => setEventDetails({ ...eventDetails, endDate: new Date(e.target.value).getTime() })}
                        />
                      </div>
                      <Input
                        label="Guest Count"
                        type="number"
                        value={eventDetails.guestCount}
                        onChange={(e) => setEventDetails({ ...eventDetails, guestCount: parseInt(e.target.value) || 0 })}
                      />
                      <Button
                        variant="primary"
                        onClick={() => setIsEditingEvent(false)}
                        className="mt-2"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gold mt-0.5" />
                        <div>
                          <p className="text-sm text-gray">Location</p>
                          <p className="font-medium text-charcoal">{eventDetails.location || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gold mt-0.5" />
                        <div>
                          <p className="text-sm text-gray">Dates</p>
                          <p className="font-medium text-charcoal">
                            {formatDateRange(eventDetails.startDate, eventDetails.endDate)}
                          </p>
                          <p className="text-xs text-gray">{days} days</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gold mt-0.5" />
                        <div>
                          <p className="text-sm text-gray">Guests</p>
                          <p className="font-medium text-charcoal">{eventDetails.guestCount}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray">Event Type</p>
                        <Badge variant="gold">{eventDetails.eventType}</Badge>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Selected Items */}
              <Card>
                <CardBody>
                  <h2 className="text-lg font-heading font-semibold text-navy mb-4">
                    Selected Items ({quoteItems.length})
                  </h2>

                  {quoteItems.length > 0 ? (
                    <div className="space-y-3">
                      {quoteItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-3 bg-mist rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-charcoal">{item.productName}</p>
                            <p className="text-sm text-gray">
                              {item.category} • {formatCurrency(item.dailyRate)}/day
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-light rounded-lg bg-white">
                              <button
                                onClick={() => updateQuantity(item.productId, -1)}
                                className="p-2 text-charcoal hover:text-navy transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-semibold text-navy">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, 1)}
                                className="p-2 text-charcoal hover:text-navy transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Line Total */}
                            <div className="text-right min-w-[80px]">
                              <p className="font-semibold text-navy">
                                {formatCurrency(item.dailyRate * item.quantity * days)}
                              </p>
                              <p className="text-xs text-gray">{days} days</p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-2 text-gray hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray mb-4">No items selected yet.</p>
                      <Button variant="outline" onClick={() => window.location.href = "/catalog"}>
                        Browse Equipment
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Customer Contact Form */}
              <Card>
                <CardBody>
                  <h2 className="text-lg font-heading font-semibold text-navy mb-4">
                    Your Contact Details
                  </h2>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={customerContact.name}
                        onChange={(e) => setCustomerContact({ ...customerContact, name: e.target.value })}
                        placeholder="John Smith"
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={customerContact.email}
                        onChange={(e) => setCustomerContact({ ...customerContact, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={customerContact.phone}
                        onChange={(e) => setCustomerContact({ ...customerContact, phone: e.target.value })}
                        placeholder="082 123 4567"
                        required
                      />
                      <Input
                        label="Company (Optional)"
                        value={customerContact.company}
                        onChange={(e) => setCustomerContact({ ...customerContact, company: e.target.value })}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Suggestions & Summary */}
            <div className="space-y-6">
              {/* Pro Suggestions */}
              {recommendations.length > 0 && (
                <Card>
                  <CardBody>
                    <ProSuggestions
                      suggestions={recommendations}
                      guestCount={eventDetails.guestCount}
                      onAddToQuote={addSuggestion}
                      onDismiss={dismissSuggestion}
                    />
                  </CardBody>
                </Card>
              )}

              {/* Quote Summary */}
              <Card className="sticky top-24">
                <CardBody>
                  <h2 className="text-lg font-heading font-semibold text-navy mb-4">
                    Quote Summary
                  </h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray">Items ({quoteItems.length})</span>
                      <span className="text-charcoal">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray">Duration</span>
                      <span className="text-charcoal">{days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray">Delivery Fee</span>
                      <span className="text-gray">To be calculated</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-light pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-semibold text-navy">Estimated Total</span>
                      <span className="text-2xl font-bold text-navy">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <p className="text-xs text-gray mt-1">
                      Final quote will include delivery and any applicable discounts
                    </p>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!customerContact.name || !customerContact.email || !customerContact.phone || quoteItems.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray text-center mt-3">
                    Our team will review and respond within 4 hours
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Helper function to generate recommendation reasons
function getRecommendationReason(category: string, guestCount: number): string {
  const reasons: Record<string, string> = {
    "Sanitation": `Events with ${guestCount}+ guests typically need additional sanitation facilities.`,
    "Power": "Power demand increases with event size. Consider this for reliable coverage.",
    "Audio": `Ensure all guests can hear clearly with equipment suitable for ${guestCount}+ guests.`,
    "Structures": "Weather protection is essential for outdoor events of this size.",
    "Seating": "Ensure adequate seating capacity for your guest count.",
    "Lighting": "Create the right ambiance with appropriate lighting for your event.",
  };
  return reasons[category] || "Recommended for your event size.";
}
