"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// ============================================
// ADMIN — Edit Product
// ============================================

const CATEGORIES = [
    "Sanitation",
    "Structures",
    "Power",
    "Audio",
    "Seating",
    "Lighting",
    "Catering",
    "Climate",
];

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as Id<"products">;
    const product = useQuery(api.products.getById, { id: productId });
    const updateProduct = useMutation(api.products.update);
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "Sanitation",
        dailyRate: 0,
        totalStock: 1,
        minGuests: 0,
        maxGuests: 0,
        isActive: true,
    });

    // Populate form when product loads
    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                description: product.description,
                category: product.category,
                dailyRate: product.dailyRate,
                totalStock: product.totalStock,
                minGuests: product.minGuests ?? 0,
                maxGuests: product.maxGuests ?? 0,
                isActive: product.isActive,
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProduct({
                id: productId,
                name: form.name,
                description: form.description,
                category: form.category,
                dailyRate: form.dailyRate,
                totalStock: form.totalStock,
                minGuests: form.minGuests || undefined,
                maxGuests: form.maxGuests || undefined,
                isActive: form.isActive,
            });
            router.push("/admin/products");
        } catch (error) {
            console.error("Failed to update product:", error);
            setSaving(false);
        }
    };

    if (!product) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <a
                    href="/admin/products"
                    className="p-2 text-gray hover:text-navy rounded-lg hover:bg-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </a>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy">Edit Product</h1>
                    <p className="text-gray mt-1">{product.name}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-light p-6 space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Product Name *</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Description *</label>
                    <textarea
                        required
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
                    />
                </div>

                {/* Category + Rate */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Category *</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-white"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Daily Rate (R) *</label>
                        <input
                            type="number"
                            required
                            min={0}
                            value={form.dailyRate}
                            onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                        />
                    </div>
                </div>

                {/* Stock + Guest Range */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Total Stock *</label>
                        <input
                            type="number"
                            required
                            min={1}
                            value={form.totalStock}
                            onChange={(e) => setForm({ ...form, totalStock: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Min Guests</label>
                        <input
                            type="number"
                            min={0}
                            value={form.minGuests}
                            onChange={(e) => setForm({ ...form, minGuests: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Max Guests</label>
                        <input
                            type="number"
                            min={0}
                            value={form.maxGuests}
                            onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                        />
                    </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4 text-gold focus:ring-gold border-gray-light rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-navy">
                        Active (visible in catalog)
                    </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-light">
                    <a href="/admin/products">
                        <Button variant="outline" size="md" type="button">
                            Cancel
                        </Button>
                    </a>
                    <Button variant="gold" size="md" type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
