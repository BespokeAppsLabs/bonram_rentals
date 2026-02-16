import React from 'react';
import { TemplateProps } from './template-types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const FinancialTemplate: React.FC<TemplateProps> = ({
    data,
    pageItems,
    pageNumber,
    totalPages,
    isLastPage
}) => {
    // 15% VAT calculation
    const vatRate = 15;
    const vat = data.subtotal * (vatRate / 100);
    const totalInclVat = data.subtotal + vat;

    return (
        <article className="bg-white h-[297mm] w-[210mm] max-h-[297mm] overflow-hidden mx-auto relative shadow-lg text-slate-800 font-sans flex flex-col box-border">

            {/* Top Decorative Lines */}
            <div className="w-full flex flex-col">
                <div className="h-3 w-full bg-[#1e3a5f]" />
                <div className="h-1.5 w-full bg-[#d4af37]" />
            </div>

            {/* Main Content - Added pb-24 to prevent overlap with absolute footer */}
            <div className="flex-grow px-10 py-4 pb-24 flex flex-col overflow-hidden">
                {/* Header: Title Left, Logo Right */}
                <header className="flex justify-between items-start mb-2 flex-shrink-0">
                    <div className="flex flex-col gap-1 pt-2">
                        <div className="text-slate-500 text-[10px] font-medium uppercase tracking-widest w-fit">
                            {data.type}
                        </div>
                        <h1 className="text-3xl font-bold text-[#1e3a5f] m-0 uppercase">
                            {data.type === 'Tax Invoice' ? 'TAX INVOICE' : 'QUOTATION'}
                        </h1>
                    </div>
                    <img src="/bonram-rentals-logo.jpeg" alt="Bonram Logo" className="w-[160px] h-auto object-contain" />
                </header>

                {/* Metadata Banner - Single Grid Container */}
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-sm grid grid-cols-4 gap-4 mb-2 flex-shrink-0">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Document Number</span>
                        <span className="text-xs font-semibold text-slate-700">{data.invoiceNumber}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Issue Date</span>
                        <span className="text-xs font-semibold text-slate-700">{format(data.issuedDate, 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Valid Until</span>
                        <span className="text-xs font-semibold text-slate-700">{format(data.dueDate, 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Currency</span>
                        <span className="text-base font-black text-slate-900">ZAR</span>
                    </div>
                </div>

                {/* Logistics Bar (Dynamic - matching style) */}
                {data.logistics && (
                    <div className="bg-slate-50 border border-slate-200 p-2 mb-2 rounded-sm grid grid-cols-3 gap-4 flex-shrink-0">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Vendor No</span>
                            <span className="font-bold text-slate-800 text-xs">{data.logistics.vendorNo || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-slate-400">PO Number</span>
                            <span className="font-bold text-slate-800 text-xs">{data.logistics.poNumber || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-slate-400">GR Number</span>
                            <span className="font-bold text-slate-800 text-xs">{data.logistics.grNumber || 'N/A'}</span>
                        </div>
                    </div>
                )}

                {/* Billed From/To */}
                <div className="grid grid-cols-2 gap-8 mb-3 flex-shrink-0">
                    <div>
                        <h3 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Billed From</h3>
                        <div className="text-xs leading-relaxed text-slate-700">
                            <strong className="text-[#1e3a5f] block mb-0.5 text-sm">Bonram (Pty) Ltd</strong>
                            Reg: 2021/654321/07<br />
                            VAT: 41234567890<br />
                            Lephalale, Limpopo<br />
                            South Africa
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Billed To</h3>
                        <div className="text-xs leading-relaxed text-slate-700">
                            <strong className="text-[#1e3a5f] block mb-0.5 text-sm">{data.customerContact.name}</strong>
                            {data.customerContact.company && <span className="font-medium block mb-0.5">{data.customerContact.company}</span>}
                            <div className="whitespace-pre-line">{data.customerContact.address || data.customerContact.email}</div>
                            {data.customerContact.vatNumber && <div className="mt-0.5 text-[10px] text-slate-500">VAT: {data.customerContact.vatNumber}</div>}
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full mb-2 border-collapse flex-grow-0">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="text-left py-1.5 px-2 text-[10px] uppercase font-bold w-[45%]">Description</th>
                            <th className="text-center py-1.5 px-2 text-[10px] uppercase font-bold w-[10%]">UOM</th>
                            <th className="text-center py-1.5 px-2 text-[10px] uppercase font-bold w-[10%]">Qty</th>
                            <th className="text-right py-1.5 px-2 text-[10px] uppercase font-bold w-[15%]">Unit Price</th>
                            <th className="text-right py-1.5 px-2 text-[10px] uppercase font-bold w-[20%]">Total Price</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {pageItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-1 px-2 text-slate-800 font-medium">{item.description}</td>
                                <td className="py-1 px-2 text-center text-slate-600">{item.uom || 'Unit'}</td>
                                <td className="py-1 px-2 text-center text-slate-600">{item.quantity}</td>
                                <td className="py-1 px-2 text-right text-slate-600 font-mono">{formatCurrency(item.unitPrice || 0)}</td>
                                <td className="py-1 px-2 text-right font-bold text-[#1e3a5f] font-mono">{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Solid bar after items */}
                <div className="h-1 bg-slate-800 w-full mb-2 flex-shrink-0"></div>

                {/* Totals Section */}
                {isLastPage && (
                    <div className="mt-1 flex flex-col gap-1 ml-auto w-1/3 min-w-[300px] flex-shrink-0">
                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Subtotal</span>
                            <span className="font-bold text-[#1e3a5f] text-sm">{formatCurrency(data.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-500">VAT (15%)</span>
                            <span className="font-bold text-[#1e3a5f] text-sm">{formatCurrency(data.vatAmount)}</span>
                        </div>
                        {/* Golden line before total */}
                        <div className="h-0.5 bg-[#d4af37] w-full my-1"></div>
                        <div className="flex justify-between items-center py-1 text-lg">
                            <span className="font-bold text-[#1e3a5f]">Total Due</span>
                            <span className="font-black text-[#1e3a5f]">{formatCurrency(data.total)}</span>
                        </div>
                    </div>
                )}

                {/* Banking Details - Only on Last Page */}
                {isLastPage ? (
                    <div className="mt-4 p-2 border border-slate-200 bg-slate-50 rounded-sm flex-shrink-0">
                        <h3 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Banking Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-700">
                            <div><strong className="font-bold text-[#1e3a5f]">Account Name:</strong> Bonram (Pty) Ltd</div>
                            <div><strong className="font-bold text-[#1e3a5f]">Bank:</strong> {data.banking?.bankName || data.bankName || 'First National Bank'}</div>
                            <div><strong className="font-bold text-[#1e3a5f]">Account Number:</strong> {data.banking?.accountNumber || data.accountNumber || '62406454786'}</div>
                            <div><strong className="font-bold text-[#1e3a5f]">Branch Code:</strong> {data.banking?.branchCode || data.branchCode || '210755'}</div>
                        </div>
                    </div>
                ) : (
                    /* Continued Message for intermediate pages */
                    <div className="mt-auto pt-8 pb-4 text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                            Continued on next page...
                        </span>
                    </div>
                )}
            </div>

            {/* Footer - Absolutely Positioned */}
            <div className="absolute bottom-0 w-full">
                <div className="px-12 py-2 flex items-center justify-between">
                    <img src="/bonram-rentals-logo.jpeg" alt="Bonram Logo" className="h-6 w-auto opacity-80" />
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="text-[9px] text-slate-400">
                            Bonram (Pty) Ltd | Bridging the Digital Divide
                        </div>
                        <div className="text-[9px] font-bold text-[#1e3a5f]">
                            Page {pageNumber} of {totalPages}
                        </div>
                    </div>
                </div>
                {/* Decorative Footer Lines */}
                <div className="w-full flex flex-col">
                    <div className="h-1.5 w-full bg-[#d4af37]" />
                    <div className="h-3 w-full bg-[#1e3a5f]" />
                </div>
            </div>
        </article>
    );
};
