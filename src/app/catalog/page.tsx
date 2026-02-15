"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard, type Product } from "@/components/catalog/product-card";
import { QuoteTray } from "@/components/catalog/quote-tray";
import { Button } from "@/components/ui";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/use-products";

// ============================================
// EQUIPMENT CATALOG PAGE
// Spacious Grid Layout with Filtering
// Connected to Convex Database
// ============================================

export default function CatalogPage() {
  // Fetch products and categories from Convex
  const { products, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [guestFilter, setGuestFilter] = useState<number | null>(null);

  // Quote state
  const [quoteItems, setQuoteItems] = useState<{
    productId: string;
    productName: string;
    dailyRate: number;
    quantity: number;
  }[]>([]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
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
  }, [products, searchQuery, selectedCategory, guestFilter]);

  // All categories with "All" option
  const allCategories = ["All", ...categories];

  // Add to quote handler
  const handleAddToQuote = (productId: string, quantity: number) => {
    const product = products?.find((p) => p._id === productId);
    if (!product) return;

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
    sessionStorage.setItem("quoteItems", JSON.stringify(quoteItems));
    window.location.href = "/quote";
  };

  // Loading state
  if (productsLoading) {
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
            Showing {filteredProducts.length} of {products?.length ?? 0} items
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
