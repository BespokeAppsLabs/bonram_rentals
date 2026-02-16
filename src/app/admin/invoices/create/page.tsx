"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { ArrowLeft, Sparkles, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminCreateInvoicePage() {
    const createStandalone = useMutation(api.quotations.createStandalone);
    const createInvoice = useMutation(api.invoices.create);
    const router = useRouter();

    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [docType, setDocType] = useState<"invoice" | "quotation">("quotation");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerEmail) return;

        setSaving(true);
        try {
            // 1. Create a blank quotation for this document
            const quotationId = await createStandalone({
                customerName,
                customerEmail,
            });

            // 2. If it's an invoice, officially "generate" it now
            if (docType === "invoice") {
                const dueDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
                const invoiceId = await createInvoice({
                    quotationId,
                    docType: "invoice",
                    dueDate,
                });
                router.push(`/admin/invoices/${invoiceId}/studio`);
            } else {
                // If it's a quotation, go to the dedicated quotation studio
                router.push(`/admin/quotations/${quotationId}/studio`);
            }
        } catch (error) {
            console.error("Failed to create document:", error);
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/invoices" className="p-2 text-gray hover:text-navy rounded-lg hover:bg-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy">New Document</h1>
                    <p className="text-gray mt-1">Start a professional document from scratch</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-light p-8 shadow-xl shadow-navy/5 space-y-8">
                    <div className="flex p-1 bg-mist rounded-xl gap-1">
                        <button
                            type="button"
                            onClick={() => setDocType("quotation")}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${docType === 'quotation' ? 'bg-navy text-white shadow-lg' : 'text-gray hover:bg-white'}`}
                        >
                            Quotation
                        </button>
                        <button
                            type="button"
                            onClick={() => setDocType("invoice")}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${docType === 'invoice' ? 'bg-gold text-white shadow-lg' : 'text-gray hover:bg-white'}`}
                        >
                            Tax Invoice
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-navy uppercase tracking-[2px] mb-3 opacity-60">
                                <UserPlus className="w-3 h-3 text-gold" />
                                Customer Information
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Client Name (e.g. John Doe)"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    className="w-full px-5 py-4 bg-mist/50 border border-gray-light rounded-xl focus:bg-white focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all placeholder:text-gray/50 font-medium"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    required
                                    className="w-full px-5 py-4 bg-mist/50 border border-gray-light rounded-xl focus:bg-white focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all placeholder:text-gray/50 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gold/5 border border-gold/10 p-6 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gold text-white rounded-xl shadow-lg shadow-gold/20">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-navy mb-1">Instant Design Studio</h3>
                                <p className="text-xs text-charcoal leading-relaxed opacity-70">
                                    You'll be redirected to the Document Studio immediately after creation to add line items, customize templates, and finalize branding.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-light">
                        <Link href="/admin/invoices" className="text-sm font-bold text-gray hover:text-navy transition-colors">
                            Cancel
                        </Link>
                        <Button
                            variant="gold"
                            size="lg"
                            type="submit"
                            disabled={saving || !customerName || !customerEmail}
                            className="min-w-[240px] shadow-xl shadow-gold/20"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <>Initialize {docType === "invoice" ? "Invoice" : "Quotation"}</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
