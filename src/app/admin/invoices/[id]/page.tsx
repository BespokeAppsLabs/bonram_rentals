"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { DocumentPreview } from "@/components/invoice/document-preview";
import { DocumentType, TemplateStyle, DocumentData } from "@/types/document";
import { Loader2, ArrowLeft, Palette } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useRef } from "react";
import { PdfDownloadButton } from "@/components/ui/PdfDownloadButton";

export default function AdminInvoiceViewPage() {
    const params = useParams();
    const invoiceId = params.id as Id<"invoices">;
    const data = useQuery(api.invoices.getById, { id: invoiceId });
    const contentRef = useRef<HTMLDivElement>(null);

    if (!data) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    const { invoice, quotation, lineItems } = data;

    // Map Convex data to DocumentData
    const docData: DocumentData = {
        id: invoice._id,
        type: invoice.docType === "invoice" ? DocumentType.INVOICE : DocumentType.QUOTATION,
        templateStyle: (invoice.templateStyle as TemplateStyle) || TemplateStyle.BONRAM_FINANCIAL,
        invoiceNumber: invoice.invoiceNumber,
        issuedDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        subtotal: invoice.subtotal,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        status: invoice.status,
        customerContact: {
            name: quotation.customerContact.name,
            email: quotation.customerContact.email,
            phone: quotation.customerContact.phone,
            company: quotation.customerContact.name,
            address: quotation.eventDetails.location,
        },
        lineItems: lineItems.map(item => ({
            id: item._id,
            description: item.productName,
            uom: "day",
            quantity: item.quantity,
            unitPrice: item.priceAtTime,
            total: item.lineTotal,
        })),
        branding: invoice.branding ? {
            x: invoice.branding.logoX,
            y: invoice.branding.logoY,
            scale: invoice.branding.logoScale,
            opacity: invoice.branding.logoOpacity,
            isBack: invoice.branding.logoIsBack,
            logoUrl: invoice.branding.logoUrl || '/Logo.png',
        } : undefined,
    };

    const pdfFilename = `${invoice.docType === 'invoice' ? 'Invoice' : 'Quote'}-${invoice.invoiceNumber}.pdf`;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/admin/invoices" className="p-2 text-gray hover:text-navy rounded-lg hover:bg-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-navy">{invoice.invoiceNumber}</h1>
                        <p className="text-sm text-gray">{invoice.docType === 'invoice' ? 'Tax Invoice' : 'Quotation'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/admin/invoices/${invoiceId}/studio`}>
                        <Button variant="outline" size="md" className="border-gold text-gold hover:bg-gold/5">
                            <Palette className="w-4 h-4 mr-2" /> Design Studio
                        </Button>
                    </Link>

                    <PdfDownloadButton
                        targetRef={contentRef}
                        filename={pdfFilename}
                        variant="primary"
                        className="bg-navy hover:bg-navy/90"
                    />
                </div>
            </div>

            <div className="flex justify-center bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-inner overflow-hidden">
                <div ref={contentRef} className="max-w-[210mm] w-full shadow-2xl bg-white">
                    <DocumentPreview data={docData} readOnly />
                </div>
            </div>
        </div>
    );
}
