"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { DocumentStudio } from "@/components/invoice/document-studio";
import { DocumentType, TemplateStyle, DocumentData } from "@/types/document";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export default function InvoiceStudioPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as Id<"invoices">;
    const data = useQuery(api.invoices.getById, { id });
    const updateSettings = useMutation(api.invoices.updateSettings);

    if (!data) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const { invoice, quotation, lineItems } = data;

    // Map Convex data to DocumentData
    const initialData: DocumentData = {
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
            company: quotation.customerContact.name, // Usually same in this schema
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

    const handleSave = async (updatedData: DocumentData) => {
        try {
            await updateSettings({
                id,
                templateStyle: updatedData.templateStyle,
                branding: updatedData.branding ? {
                    logoX: updatedData.branding.x,
                    logoY: updatedData.branding.y,
                    logoScale: updatedData.branding.scale,
                    logoOpacity: updatedData.branding.opacity,
                    logoIsBack: updatedData.branding.isBack,
                    logoUrl: updatedData.branding.logoUrl,
                } : undefined,
            });
            router.push(`/admin/invoices/${id}`);
        } catch (error) {
            console.error("Failed to save document settings:", error);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="md" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Design Studio</h1>
                        <p className="text-xs text-slate-400 font-medium">Customizing {invoice.invoiceNumber}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[700px]">
                <DocumentStudio
                    initialData={initialData}
                    quotationId={quotation._id}
                    invoiceId={invoice._id}
                    onSave={() => router.push(`/admin/invoices/${id}`)}
                />
            </div>
        </div>
    );
}
