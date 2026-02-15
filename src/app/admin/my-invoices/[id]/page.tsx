"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { InvoiceRenderer } from "@/components/invoice/invoice-renderer";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function MyInvoiceViewPage() {
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
                <Link href="/admin/my-invoices" className="flex items-center gap-2 text-sm text-gray hover:text-navy">
                    <ArrowLeft className="w-4 h-4" /> Back to Invoices
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy/90"
                >
                    <Printer className="w-4 h-4" /> Print
                </button>
            </div>
            <InvoiceRenderer {...data} />
        </div>
    );
}
