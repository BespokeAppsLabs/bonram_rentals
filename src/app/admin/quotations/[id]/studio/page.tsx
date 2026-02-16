"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DocumentStudio } from "@/components/invoice/document-studio";
import { DocumentType, TemplateStyle, DocumentData } from "@/types/document";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export default function QuotationStudioPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id as Id<"quotations">;
    const data = useQuery(api.quotations.getById, { id });

    if (!data) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const { items, ...quotation } = data;

    // Determine initial template from query param or stored data
    const templateParam = searchParams.get("template");
    let requestedStyle = quotation.templateStyle as TemplateStyle;

    if (templateParam === "letter") requestedStyle = TemplateStyle.BONRAM_LETTER;
    if (templateParam === "report") requestedStyle = TemplateStyle.BONRAM_REPORT;
    if (templateParam === "financial") requestedStyle = TemplateStyle.BONRAM_FINANCIAL;

    // Map Convex data to DocumentData
    const initialData: DocumentData = {
        id: quotation._id,
        type: DocumentType.QUOTATION,
        templateStyle: requestedStyle || (quotation.templateStyle as TemplateStyle) || TemplateStyle.BONRAM_FINANCIAL,
        invoiceNumber: "DRAFT",
        issuedDate: quotation.createdAt,
        dueDate: quotation.eventDetails.startDate,
        subtotal: quotation.subtotal,
        vatAmount: (quotation.total - quotation.subtotal), // Rough calc if not stored
        total: quotation.total,
        status: quotation.status,
        customerContact: quotation.customerContact,
        lineItems: items.map(item => ({
            id: item._id,
            description: item.description,
            uom: item.uom || "unit",
            quantity: item.quantity,
            unitPrice: item.priceAtTime,
            total: item.lineTotal,
        })),
        branding: quotation.branding ? {
            x: quotation.branding.logoX,
            y: quotation.branding.logoY,
            scale: quotation.branding.logoScale,
            opacity: quotation.branding.logoOpacity,
            isBack: quotation.branding.logoIsBack,
            logoUrl: quotation.branding.logoUrl || '/Logo.png',
        } : undefined,
    };

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="md" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Quotation Studio</h1>
                        <p className="text-xs text-slate-400 font-medium">Drafting for {quotation.customerContact.name}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[700px]">
                <DocumentStudio
                    initialData={initialData}
                    quotationId={quotation._id}
                    onSave={() => router.push(`/admin/quotations/${id}`)}
                />
            </div>
        </div>
    );
}
