"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateInvoicePage() {
    const quotations = useQuery(api.quotations.getAll);
    const createInvoice = useMutation(api.invoices.create);
    const router = useRouter();
    const [selectedQuotationId, setSelectedQuotationId] = useState("");
    const [docType, setDocType] = useState<"invoice" | "quotation">("invoice");
    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0];
    });
    const [saving, setSaving] = useState(false);

    const confirmedQuotations = quotations?.filter((q) => q.status === "confirmed") ?? [];
    const selectedQuotation = confirmedQuotations.find((q) => q._id === selectedQuotationId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuotationId) return;
        setSaving(true);
        try {
            await createInvoice({
                quotationId: selectedQuotationId as any,
                docType,
                dueDate: new Date(dueDate).getTime(),
            });
            router.push("/admin/invoices");
        } catch (error) {
            console.error("Failed to create invoice:", error);
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-8">
                <a href="/admin/invoices" className="p-2 text-gray hover:text-navy rounded-lg hover:bg-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </a>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy">Create Invoice</h1>
                    <p className="text-gray mt-1">Generate from a confirmed quotation</p>
                </div>
            </div>

            {!quotations ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-light p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Document Type</label>
                        <select value={docType} onChange={(e) => setDocType(e.target.value as any)}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg bg-white focus:ring-2 focus:ring-gold/50">
                            <option value="invoice">Invoice</option>
                            <option value="quotation">Quotation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Confirmed Quotation *</label>
                        {confirmedQuotations.length === 0 ? (
                            <p className="text-sm text-gray bg-mist p-3 rounded-lg">No confirmed quotations available.</p>
                        ) : (
                            <select value={selectedQuotationId} onChange={(e) => setSelectedQuotationId(e.target.value)} required
                                className="w-full px-4 py-2.5 border border-gray-light rounded-lg bg-white focus:ring-2 focus:ring-gold/50">
                                <option value="">Select a quotation...</option>
                                {confirmedQuotations.map((q) => (
                                    <option key={q._id} value={q._id}>
                                        {q.customerContact.name} — {q.eventDetails.location} — {formatCurrency(q.total)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {selectedQuotation && (
                        <div className="bg-mist p-4 rounded-lg text-sm space-y-1">
                            <p><strong>Customer:</strong> {selectedQuotation.customerContact.name}</p>
                            <p><strong>Event:</strong> {selectedQuotation.eventDetails.location}</p>
                            <p><strong>Dates:</strong> {new Date(selectedQuotation.eventDetails.startDate).toLocaleDateString()} — {new Date(selectedQuotation.eventDetails.endDate).toLocaleDateString()}</p>
                            <p><strong>Subtotal:</strong> {formatCurrency(selectedQuotation.subtotal)}</p>
                            <p><strong>Total:</strong> {formatCurrency(selectedQuotation.total)}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-navy mb-1.5">Due Date</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-light">
                        <a href="/admin/invoices"><Button variant="outline" size="md" type="button">Cancel</Button></a>
                        <Button variant="gold" size="md" type="submit" disabled={saving || !selectedQuotationId}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Create {docType === "invoice" ? "Invoice" : "Quotation"}</>}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
