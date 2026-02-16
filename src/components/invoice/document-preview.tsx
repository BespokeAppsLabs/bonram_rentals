"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DocumentData, TemplateStyle } from '@/types/document';
import { paginateItems } from '@/lib/pagination';
import {
    FinancialTemplate,
    LetterTemplate,
    ReportTemplate,
} from './templates';

interface Props {
    data: DocumentData;
    onChangeBranding?: (branding: DocumentData['branding']) => void;
    readOnly?: boolean;
}

export const DocumentPreview: React.FC<Props> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Pagination Logic moved to lib/pagination.ts
    const lineItemPages = paginateItems(data.lineItems || []);
    // Ensure at least one page for Letter/Report even if no line items
    const totalPages = Math.max(lineItemPages.length, (data.templateStyle === TemplateStyle.BONRAM_FINANCIAL ? 1 : 2));
    const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

    const renderTemplate = (pageNumber: number) => {
        const templateProps = {
            data,
            pageItems: lineItemPages[pageNumber - 1] || [],
            pageNumber,
            totalPages,
            isLastPage: pageNumber === totalPages
        };

        switch (data.templateStyle) {
            case TemplateStyle.BONRAM_FINANCIAL:
                return <FinancialTemplate {...templateProps} />;
            case TemplateStyle.BONRAM_LETTER:
                return <LetterTemplate {...templateProps} />;
            case TemplateStyle.BONRAM_REPORT:
                return <ReportTemplate {...templateProps} />;
            default:
                return <FinancialTemplate {...templateProps} />;
        }
    };

    return (
        <div className="flex flex-col gap-12 items-center w-full py-12">
            {pagesArray.map((pageNumber) => (
                <div
                    key={pageNumber}
                    className="pdf-page relative shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.01] duration-500 rounded-sm"
                >
                    {renderTemplate(pageNumber)}
                </div>
            ))}
        </div>
    );
};
