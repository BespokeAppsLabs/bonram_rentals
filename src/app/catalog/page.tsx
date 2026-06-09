"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard, type Product } from "@/components/catalog/product-card";
import { QuoteTray } from "@/components/catalog/quote-tray";
import { Button } from "@/components/ui";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useProducts, useCategories, useProductsWithAvailability } from "@/hooks/use-products";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ============================================
// EQUIPMENT CATALOG PAGE
// Spacious Grid Layout with Filtering
// Connected to Convex Database
// ============================================

export default function CatalogPage() {
  // Fetch products and categories from Convex
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { categories } = useCategories();
  const [dateRange, setDateRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });
  const availability = useProductsWithAvailability(dateRange.start, dateRange.end);
  const trackFunnelEvent = useMutation(api.analytics.trackFunnelEvent);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [guestFilter, setGuestFilter] = useState<number | null>(null);
  const [location, setLocation] = useState("");

  // Quote state
  const [quoteItems, setQuoteItems] = useState<{
    productId: string;
    productName: string;
    dailyRate: number;
    category: string;
    quantity: number;
  }[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get("startDate");
    const end = params.get("endDate");
    const guests = Number(params.get("guests"));
    const category = params.get("category");
    setLocation(params.get("location") ?? "");
    if (category) setSelectedCategory(category);
    if (Number.isFinite(guests) && guests > 0) setGuestFilter(guests);
    if (start && end) {
      const startMs = new Date(start).getTime();
      const endMs = new Date(end).getTime();
      if (Number.isFinite(startMs) && Number.isFinite(endMs)) {
        setDateRange({ start: startMs, end: endMs });
      }
    }
    void trackFunnelEvent({ event: "catalog_viewed", source: params.has("startDate") ? "planner" : "direct" });
  }, [trackFunnelEvent]);

  const catalogProducts = availability.products ?? products;

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!catalogProducts) return [];

    return catalogProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }

      // Guest count filter
      if (guestFilter) {
        const minGuests = product.minGuests ?? 0;
        const maxGuests = product.maxGuests ?? Infinity;
        return guestFilter >= minGuests && guestFilter <= maxGuests;
      }

      return true;
    });
  }, [catalogProducts, searchQuery, selectedCategory, guestFilter]);

  // All categories with "All" option
  const allCategories = ["All", ...categories];

  // Add to quote handler
  const handleAddToQuote = (productId: string, quantity: number) => {
    const product = catalogProducts?.find((p) => p._id === productId);
    if (!product) return;
    void trackFunnelEvent({ event: "item_added", source: "catalog" });

    setQuoteItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId,
          productName: product.name,
          dailyRate: product.dailyRate,
          category: product.category,
          quantity,
        },
      ];
    });
  };

  // Remove from quote handler
  const handleRemoveFromQuote = (productId: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Navigate to quote page
  const handleReviewQuote = () => {
    // Store quote items in sessionStorage for the quote page
    localStorage.setItem("bonramQuoteCartV1", JSON.stringify(quoteItems));
    sessionStorage.setItem("quoteItems", JSON.stringify(quoteItems));
    if (dateRange.start && dateRange.end) {
      localStorage.setItem("bonramEventV1", JSON.stringify({
        startDate: dateRange.start,
        endDate: dateRange.end,
        guestCount: guestFilter,
        location,
      }));
    }
    window.location.href = "/quote";
  };

  if (productsLoading || availability.isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-navy mx-auto mb-4" />
            <p className="text-gray">Loading equipment catalog...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (productsError || availability.error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-mist flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-navy" />
            </div>
            <h2 className="text-xl font-heading font-bold text-navy mb-2">
              Catalog Unavailable
            </h2>
            <p className="text-gray mb-6">{productsError ?? availability.error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="gold" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <a href="tel:+27742748684">
                <Button variant="outline">Call Us: 074 274 8684</Button>
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-mist pb-24">
        {/* Page Header */}
        <div className="bg-navy py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
              Equipment Catalog
            </h1>
            <p className="text-mist">
              Browse our selection of professional event equipment
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-sm border border-gray-light focus:outline-none focus:border-gold"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === category
                        ? "bg-navy text-white"
                        : "bg-mist text-charcoal hover:bg-gray-light"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters
                    ? "border-gold bg-mist text-gold"
                    : "border-gray-light text-charcoal hover:border-navy"
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-light">
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Guest Count
                    </label>
                    <input
                      type="number"
                      placeholder="Any"
                      min="1"
                      value={guestFilter ?? ""}
                      onChange={(e) => setGuestFilter(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full md:w-40 px-3 py-2 rounded-lg border border-gray-light focus:outline-none focus:border-gold"
                    />
                  </div>

                  {guestFilter && (
                    <button
                      onClick={() => setGuestFilter(null)}
                      className="self-end flex items-center gap-1 text-sm text-gray hover:text-charcoal"
                    >
                      <X className="w-4 h-4" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <p className="text-gray mb-4">
            Showing {filteredProducts.length} of {catalogProducts?.length ?? 0} items
          </p>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product as Product}
                  onAddToQuote={handleAddToQuote}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <p className="text-gray text-lg mb-4">No equipment found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setGuestFilter(null);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Quote Tray */}
      {quoteItems.length > 0 && (
        <QuoteTray
          items={quoteItems}
          guestCount={guestFilter ?? undefined}
          onReviewQuote={handleReviewQuote}
          onRemoveItem={handleRemoveFromQuote}
        />
      )}

      <Footer />
    </>
  );
}
