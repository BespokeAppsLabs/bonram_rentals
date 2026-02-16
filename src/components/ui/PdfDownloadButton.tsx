"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Download, Loader2 } from 'lucide-react';


import { pdf } from '@react-pdf/renderer';
import { FinancialPdfTemplate } from '../invoice/pdf-templates/FinancialPdfTemplate';
import { DocumentData, TemplateStyle } from '@/types/document';

interface PdfDownloadButtonProps {
    targetRef?: React.RefObject<HTMLElement | null>; // Made optional for client-side only mode
    filename: string;
    label?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    className?: string;
    data?: DocumentData; // New prop for client-side generation
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
    targetRef,
    filename,
    label = "Download PDF",
    variant = "primary",
    className,
    data
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);

        try {
            // New Client-Side Generation for Financial Templates
            if (data && data.templateStyle === TemplateStyle.BONRAM_FINANCIAL) {
                console.log("Generating PDF client-side...");
                const blob = await pdf(<FinancialPdfTemplate data={data} />).toBlob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return;
            }

            // Fallback for other templates (Temporarily disabled during migration)
            alert("PDF generation for this template type is currently being migrated. Please contact support or use the Financial template.");
            return;

            /* Legacy Server-Side Logic Removed
            if (!targetRef?.current) { ... }
            ...
            */


        } catch (error: any) {
            console.error("PDF generation failed:", error);
            alert(`Failed to generate PDF. Error: ${error?.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isGenerating}
            variant={variant}
            className={className}
        >
            {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Download className="w-4 h-4 mr-2" />
            )}
            {label}
        </Button>
    );
};
