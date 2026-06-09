"use client";

import { use } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui";
import { useProduct } from "@/hooks/use-products";
import { formatCurrency } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { product, isLoading, error } = useProduct(id as Id<"products">);

  const addToQuote = () => {
    if (!product) return;
    const stored = localStorage.getItem("bonramQuoteCartV1");
    let items: Array<{ productId: string; productName: string; category: string; dailyRate: number; quantity: number }> = [];
    try {
      items = stored ? JSON.parse(stored) : [];
    } catch {
      localStorage.removeItem("bonramQuoteCartV1");
    }
    const existing = items.find((item: { productId: string }) => item.productId === product._id);
    const next = existing
      ? items.map((item: { productId: string; quantity: number }) => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { productId: product._id, productName: product.name, category: product.category, dailyRate: product.dailyRate, quantity: 1 }];
    localStorage.setItem("bonramQuoteCartV1", JSON.stringify(next));
    window.location.href = "/quote";
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist">
        <div className="container mx-auto px-4 py-8">
          <a href="/catalog" className="inline-flex items-center text-sm text-navy hover:text-gold mb-6"><ArrowLeft className="w-4 h-4 mr-2" />Back to catalog</a>
          {isLoading && <div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" /></div>}
          {error && <p className="py-24 text-center text-error">{error}</p>}
          {product && (
            <div className="grid lg:grid-cols-2 gap-10 bg-white border border-gray-light rounded-xl overflow-hidden">
              <div className="min-h-[360px] bg-navy flex items-center justify-center">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-white/70">Image coming soon</span>}
              </div>
              <div className="p-8 lg:p-12">
                <p className="text-gold uppercase tracking-widest text-sm font-semibold mb-3">{product.category}</p>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-5">{product.name}</h1>
                <p className="text-gray text-lg mb-8">{product.description}</p>
                <div className="border-y border-gray-light py-5 mb-8 grid sm:grid-cols-2 gap-4">
                  <div><p className="text-xs uppercase tracking-wide text-gray">Starting rate</p><p className="text-2xl font-bold text-navy">{formatCurrency(product.dailyRate)} / day</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-gray">Stock</p><p className="text-2xl font-bold text-navy">{product.totalStock} units</p></div>
                </div>
                <div className="space-y-2 mb-8 text-sm text-gray">
                  <p className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold mt-0.5" />Professionally maintained and prepared</p>
                  <p className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold mt-0.5" />Final availability confirmed for selected dates</p>
                  <p className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold mt-0.5" />Delivery and setup quoted separately</p>
                </div>
                <Button variant="gold" size="lg" onClick={addToQuote}>Add to Quote Request</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
