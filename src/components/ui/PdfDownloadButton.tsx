"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Download, Loader2 } from 'lucide-react';


interface PdfDownloadButtonProps {
    targetRef: React.RefObject<HTMLElement | null>;
    filename: string;
    label?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    className?: string;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
    targetRef,
    filename,
    label = "Download PDF",
    variant = "primary",
    className
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!targetRef?.current) {
            console.error("Target element not found");
            alert("Error: Target element not found for PDF generation.");
            return;
        }

        setIsGenerating(true);

        try {
            // 1. Capture Styles (tailored for Next.js/Tailwind)
            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(node => {
                    if (node.tagName === 'LINK') {
                        const link = node as HTMLLinkElement;
                        return `<link rel="stylesheet" href="${link.href}" />`;
                    }
                    return node.outerHTML;
                })
                .join('\n');

            const origin = window.location.origin;

            // 2. Capture Pages
            // We look for .pdf-page elements within the target.
            const container = targetRef.current;
            const pageElements = container.querySelectorAll('.pdf-page');

            let combinedHtml = '';

            if (pageElements.length > 0) {
                // Multi-page or Single-page with proper class
                combinedHtml = Array.from(pageElements).map(page => {
                    // content is the article inside the pdf-page wrapper
                    return `
                        <div style="page-break-after: always; height: 297mm; overflow: hidden; position: relative; width: 210mm; margin: 0 auto; background: white;">
                            ${page.innerHTML}
                        </div>
                    `;
                }).join('');
            } else {
                // Fallback if no .pdf-page class found (capture whole container)
                // Remove preview-specific classes if possible, or just send content.
                // But typically targetRef points to the wrapper.
                combinedHtml = `
                    <div style="page-break-after: always; height: 297mm; overflow: hidden; position: relative; width: 210mm; margin: 0 auto; background: white;">
                        ${container.innerHTML}
                    </div>
                `;
            }

            // 3. Send to Server API
            const response = await fetch('/api/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <base href="${origin}/">
                            ${styles}
                            <style>
                                /* Force print background colors */
                                * {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    box-sizing: border-box;
                                }
                                /* Ensure body fits content */
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: white;
                                }
                                @page {
                                    margin: 0;
                                    size: A4;
                                }
                            </style>
                        </head>
                        <body>
                            ${combinedHtml}
                        </body>
                        </html>
                    `,
                    filename: filename
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server failed to generate PDF');
            }

            // 4. Handle Blob Download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

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
