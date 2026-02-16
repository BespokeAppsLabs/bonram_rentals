"use client";

import React, { useState } from 'react';
import { DocumentData, DocumentType } from '@/types/document';
import { DocumentForm } from './document-form';
import { DocumentPreview } from './document-preview';
import { Button } from '@/components/ui';
import { Eye, Save, X, FileCheck, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'next/navigation';

interface Props {
    initialData: DocumentData;
    quotationId: string;
    invoiceId?: string;
    onSave?: (data: DocumentData) => void;
}

export const DocumentStudio: React.FC<Props> = ({ initialData, quotationId, invoiceId, onSave }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<DocumentData>(initialData);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    const products = useQuery(api.products.getAll) || [];
    const syncData = useMutation(api.quotations.syncDocumentData);
    const updateQuotationSettings = useMutation(api.quotations.updateSettings);
    const updateInvoiceSettings = useMutation(api.invoices.updateSettings);
    const convertToInvoice = useMutation(api.invoices.convertToInvoice);
    const router = useRouter();

    const handleDataChange = (updates: Partial<DocumentData>) => {
        setData(prev => {
            const newData = { ...prev, ...updates };

            // Auto-calculate totals if lineItems changed
            if (updates.lineItems) {
                const subtotal = updates.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
                const vatAmount = subtotal * 0.15;
                const total = subtotal + vatAmount;

                return {
                    ...newData,
                    subtotal,
                    vatAmount,
                    total
                };
            }

            return newData;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Sync line items and metadata
            await syncData({
                id: quotationId as any,
                customerContact: data.customerContact,
                lineItems: data.lineItems.map(item => ({
                    description: item.description,
                    uom: item.uom,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || 0,
                }))
            });

            // 2. Sync design settings
            const settingsData = {
                id: (invoiceId || quotationId) as any,
                templateStyle: data.templateStyle,
                branding: undefined, // Branding is automated in new templates
            };

            if (invoiceId) {
                await updateInvoiceSettings(settingsData);
            } else {
                await updateQuotationSettings(settingsData);
            }

            if (onSave) onSave(data);
            alert("Changes saved successfully!");
        } catch (error) {
            console.error("Save failed:", error);
            alert("Save failed, check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConvert = async () => {
        if (!window.confirm("Convert this quotation to a Tax Invoice?")) return;

        setIsConverting(true);
        try {
            const newInvoiceId = await convertToInvoice({ quotationId: quotationId as any });
            router.push(`/admin/invoices/${newInvoiceId}/studio`);
        } catch (error) {
            console.error("Conversion failed:", error);
            alert("Conversion failed.");
            setIsConverting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-white rounded-sm border overflow-hidden relative">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-[400px] border-r bg-slate-50/30 overflow-y-auto p-6 scrollbar-hide">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter">Document Studio</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customize your design</p>
                    </div>
                </div>

                <DocumentForm
                    data={data}
                    onChange={handleDataChange}
                    onPreviewClick={() => setShowMobilePreview(true)}
                    products={products}
                />

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        variant="primary"
                        size="md"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>

                    {data.type === DocumentType.QUOTATION && (
                        <Button
                            onClick={handleConvert}
                            disabled={isConverting || isSaving}
                            variant="primary"
                            size="md"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/20"
                        >
                            {isConverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileCheck className="w-4 h-4 mr-2" />}
                            Convert to Invoice
                        </Button>
                    )}

                    <PdfDownloadButton
                        targetRef={previewRef}
                        filename={`${data.type === DocumentType.INVOICE ? 'Invoice' : 'Quote'}-${data.invoiceNumber || 'Draft'}.pdf`}
                        variant="outline"
                        className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 font-bold h-12 rounded-xl"
                    />
                </div>
            </div>

            {/* Live Preview Area */}
            <div className="flex-1 bg-slate-100/50 p-4 md:p-12 flex justify-center overflow-y-auto scrollbar-hide">
                <div className="max-w-[210mm] w-full origin-top transform scale-[0.45] sm:scale-[0.6] md:scale-[0.85] lg:scale-[0.9] xl:scale-100 transition-transform duration-500">
                    <div ref={previewRef}>
                        <DocumentPreview
                            data={data}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Preview Overlay */}
            {showMobilePreview && (
                <div className="lg:hidden fixed inset-0 z-[100] bg-slate-100 flex flex-col">
                    <div className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
                        <h3 className="font-black text-slate-900 tracking-tighter">Mobile Preview</h3>
                        <Button variant="ghost" size="md" onClick={() => setShowMobilePreview(false)}>
                            <X className="w-4 h-4 mr-2" /> Close
                        </Button>
                    </div>
                    <div className="flex-1 p-4 overflow-auto flex justify-center items-start pt-12">
                        <div className="max-w-full origin-top scale-[0.4] sm:scale-[0.6]">
                            <DocumentPreview data={data} />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Preview Floating Action Button */}
            {!showMobilePreview && (
                <div className="lg:hidden fixed bottom-6 right-6 z-50">
                    <Button
                        size="md"
                        variant="primary"
                        onClick={() => setShowMobilePreview(true)}
                        className="rounded-full h-14 w-14 bg-slate-900 shadow-2xl flex items-center justify-center p-0"
                    >
                        <Eye className="w-6 h-6 text-white" />
                    </Button>
                </div>
            )}
        </div>
    );
};
