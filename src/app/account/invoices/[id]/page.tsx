"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { InvoiceRenderer } from "@/components/invoice/invoice-renderer";
import { Loader2, ArrowLeft, Printer } from "lucide-react";

export default function AccountInvoiceViewPage() {
    const params = useParams();
    const invoiceId = params.id as Id<"invoices">;
    const data = useQuery(api.invoices.getById, { id: invoiceId });

    if (!data) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <a href="/account/invoices" className="p-2 text-gray hover:text-navy rounded-lg hover:bg-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <h1 className="text-2xl font-heading font-bold text-navy">{data.invoice.invoiceNumber}</h1>
                </div>
                <button onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 text-sm font-medium transition-colors print:hidden">
                    <Printer className="w-4 h-4" /> Print
                </button>
            </div>

            <InvoiceRenderer invoice={data.invoice} quotation={data.quotation} lineItems={data.lineItems} />
        </div>
    );
}
