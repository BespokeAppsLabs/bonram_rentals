"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Plus, Loader2, Eye, FileText } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    draft: "bg-gray/10 text-gray",
    sent: "bg-blue-50 text-blue-600",
    paid: "bg-emerald-50 text-emerald-600",
};

export default function AdminInvoicesPage() {
    const invoices = useQuery(api.invoices.getAll);
    const updateStatus = useMutation(api.invoices.updateStatus);

    if (!invoices) {
        return (
            <div>
                <h1 className="text-3xl font-heading font-bold text-navy mb-8">Invoices</h1>
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy">Invoices</h1>
                    <p className="text-gray mt-1">{invoices.length} total invoices</p>
                </div>
                <Link href="/admin/invoices/create">
                    <Button variant="gold" size="md"><Plus className="w-4 h-4 mr-2" /> Create Invoice</Button>
                </Link>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-light p-8 text-center">
                    <FileText className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                    <p className="text-gray font-medium">No invoices yet</p>
                    <p className="text-sm text-gray mt-1">Create an invoice from a confirmed quotation.</p>
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
                            {invoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-mist/50">
                                    <td className="px-4 py-3 text-sm font-medium text-navy">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-3 text-sm text-charcoal capitalize">{inv.docType}</td>
                                    <td className="px-4 py-3 text-sm text-gray">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-navy text-right">{formatCurrency(inv.total)}</td>
                                    <td className="px-4 py-3">
                                        <select value={inv.status} onChange={(e) => updateStatus({ id: inv._id, status: e.target.value as any })}
                                            className="text-xs font-medium px-2 py-1 rounded-full border-0 bg-gray-50 cursor-pointer">
                                            <option value="draft">Draft</option>
                                            <option value="sent">Sent</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/invoices/${inv._id}`}
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
