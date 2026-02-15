"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui";
import {
    Plus,
    Search,
    ToggleLeft,
    ToggleRight,
    Pencil,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// ============================================
// ADMIN — Products List
// ============================================

export default function AdminProductsPage() {
    const products = useQuery(api.products.getAllIncludingInactive);
    const updateProduct = useMutation(api.products.update);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const categories = products
        ? ["All", ...new Set(products.map((p) => p.category))]
        : ["All"];

    const filtered = products?.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleToggleActive = async (id: Id<"products">, isActive: boolean) => {
        await updateProduct({ id, isActive: !isActive });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy">Products</h1>
                    <p className="text-gray mt-1">
                        {products ? `${products.length} total products` : "Loading..."}
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <Button variant="gold" size="md">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-white"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            {!filtered ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-light overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-mist border-b border-gray-light">
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Product</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Category</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Rate/Day</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Stock</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Status</th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-navy">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-light">
                                {filtered.map((product) => (
                                    <tr key={product._id} className="hover:bg-mist/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-mist rounded-lg flex items-center justify-center text-navy/30 text-xs flex-shrink-0">
                                                    {product.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        "IMG"
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-navy">{product.name}</p>
                                                    <p className="text-xs text-gray line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-charcoal">{product.category}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-navy">
                                                {formatCurrency(product.dailyRate)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-charcoal">{product.totalStock}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleActive(product._id, product.isActive)}
                                                className="flex items-center gap-1.5"
                                                title={product.isActive ? "Click to deactivate" : "Click to activate"}
                                            >
                                                {product.isActive ? (
                                                    <>
                                                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                                                        <span className="text-xs text-emerald-600 font-medium">Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-6 h-6 text-gray" />
                                                        <span className="text-xs text-gray font-medium">Inactive</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/admin/products/${product._id}`}>
                                                <button className="p-2 text-gray hover:text-navy rounded-lg hover:bg-mist transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-8 text-gray">
                            No products found matching your filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
