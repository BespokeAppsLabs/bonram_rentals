"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/image-upload";

// ============================================
// ADMIN — Create Product
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

export default function NewProductPage() {
    const createProduct = useMutation(api.products.create);
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
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createProduct({
                ...form,
                minGuests: form.minGuests || undefined,
                maxGuests: form.maxGuests || undefined,
            });
            router.push("/admin/products");
        } catch (error) {
            console.error("Failed to create product:", error);
            setSaving(false);
        }
    };

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
                    <h1 className="text-3xl font-heading font-bold text-navy">New Product</h1>
                    <p className="text-gray mt-1">Add equipment to your catalog</p>
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
                        placeholder="e.g. VIP Toilet Trailer"
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
                        placeholder="Describe the product..."
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
                                Create Product
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
