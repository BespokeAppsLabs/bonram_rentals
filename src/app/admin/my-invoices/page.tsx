"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import { Loader2, FileText, Eye } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    draft: "bg-gray/10 text-gray",
    sent: "bg-blue-50 text-blue-600",
    paid: "bg-emerald-50 text-emerald-600",
};

export default function MyInvoicesPage() {
    // Use getUserSession for consistent auth handling
    const session = useQuery(api.users.getUserSession);
    const dbUser = session?.user;
    const invoices = useQuery(api.invoices.getForUser, dbUser ? { userId: dbUser._id } : "skip");

    if (!session || !dbUser || !invoices) {
        return (
            <div>
                <h1 className="text-2xl font-heading font-bold text-navy mb-6">My Invoices</h1>
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-heading font-bold text-navy mb-1">My Invoices</h1>
            <p className="text-gray text-sm mb-6">View and print your invoices</p>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-light p-8 text-center">
                    <FileText className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                    <p className="text-gray font-medium">No invoices yet</p>
                    <p className="text-sm text-gray mt-1">Invoices will appear here once created.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-light overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-mist border-b border-gray-light">
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Invoice #</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Type</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Date</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-navy">Total</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-navy">Status</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-navy">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-light">
                            {invoices.map((inv: any) => (
                                <tr key={inv._id} className="hover:bg-mist/50">
                                    <td className="px-4 py-3 text-sm font-medium text-navy">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-3 text-sm text-charcoal capitalize">{inv.docType}</td>
                                    <td className="px-4 py-3 text-sm text-gray">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-navy text-right">{formatCurrency(inv.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] ?? ""}`}>
                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/my-invoices/${inv._id}`}
                                            className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium">
                                            <Eye className="w-4 h-4" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
