"use client";

import { formatCurrency } from "@/lib/utils";

interface InvoiceRendererProps {
    invoice: {
        invoiceNumber: string;
        docType: "invoice" | "quotation";
        issuedDate: number;
        dueDate: number;
        subtotal: number;
        vatAmount: number;
        total: number;
        status: string;
    };
    quotation: {
        customerContact: { name: string; email: string; phone: string; company?: string };
        eventDetails: { location: string; startDate: number; endDate: number; guestCount: number };
    };
    lineItems: Array<{
        productName: string;
        quantity: number;
        priceAtTime: number;
        lineTotal: number;
    }>;
}

export function InvoiceRenderer({ invoice, quotation, lineItems }: InvoiceRendererProps) {
    const docTypeUpper = invoice.docType.toUpperCase();
    const title = `${docTypeUpper} ${invoice.invoiceNumber}`;

    return (
        <>
            {/* Print-only styles */}
            <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-document, .invoice-document * { visibility: visible; }
          .invoice-document { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

            <div className="invoice-document bg-white rounded-xl border border-gray-light overflow-hidden print:border-0 print:rounded-none">
                {/* Header Bar */}
                <div className="h-1.5 bg-[#1e3a5f]" />
                <div className="p-8 pb-0">
                    {/* Top: Doc label + Logo */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="inline-block px-3 py-1 bg-[#1e3a5f] text-white text-xs font-bold tracking-wider uppercase rounded-sm mb-2">
                                {docTypeUpper}
                            </div>
                            <h1 className="text-2xl font-bold" style={{ color: "#d4af37" }}>{title}</h1>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                                <div className="w-8 h-8 bg-[#1e3a5f] rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">B</span>
                                </div>
                                <span className="font-bold text-lg tracking-wider text-[#1e3a5f]">BONRAM</span>
                            </div>
                            <p className="text-xs text-gray-500">Rental Solutions</p>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-50">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Document Number</p>
                            <p className="text-sm font-semibold text-[#1e3a5f] mt-0.5">{invoice.invoiceNumber}</p>
                        </div>
                        <div className="p-3 bg-gray-50">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Issue Date</p>
                            <p className="text-sm font-semibold text-[#1e3a5f] mt-0.5">{new Date(invoice.issuedDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Valid Until</p>
                            <p className="text-sm font-semibold text-[#1e3a5f] mt-0.5">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Currency</p>
                            <p className="text-sm font-bold mt-0.5" style={{ color: "#d4af37" }}>ZAR</p>
                        </div>
                    </div>

                    {/* Billed From / To */}
                    <div className="grid grid-cols-2 gap-10 mb-8">
                        <div>
                            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed From</h3>
                            <div className="text-sm leading-relaxed">
                                <strong>Bonram (Pty) Ltd</strong><br />
                                Reg: 2021/654321/07<br />
                                VAT: 41234567890<br />
                                Lephalale, Limpopo<br />
                                South Africa
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                            <div className="text-sm leading-relaxed">
                                <strong>{quotation.customerContact.name}</strong><br />
                                {quotation.customerContact.company && <>{quotation.customerContact.company}<br /></>}
                                {quotation.customerContact.email}<br />
                                {quotation.customerContact.phone}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="px-8">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1e3a5f] text-white">
                                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ width: "45%" }}>Description</th>
                                <th className="text-center px-4 py-2.5 text-xs font-semibold" style={{ width: "10%" }}>UOM</th>
                                <th className="text-center px-4 py-2.5 text-xs font-semibold" style={{ width: "10%" }}>Qty</th>
                                <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ width: "15%" }}>Unit Price</th>
                                <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ width: "20%" }}>Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="px-4 py-2.5 text-sm">{item.productName}</td>
                                    <td className="px-4 py-2.5 text-sm text-center">day</td>
                                    <td className="px-4 py-2.5 text-sm text-center">{item.quantity}</td>
                                    <td className="px-4 py-2.5 text-sm text-right">{formatCurrency(item.priceAtTime)}</td>
                                    <td className="px-4 py-2.5 text-sm text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="px-8 py-6">
                    <div className="ml-auto max-w-xs space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Subtotal</span>
                            <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">VAT (15%)</span>
                            <span className="font-semibold">{formatCurrency(invoice.vatAmount)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#1e3a5f]" style={{ color: "#1e3a5f" }}>
                            <span>Total Due</span>
                            <span>{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>

                    {/* Banking Details */}
                    <div className="mt-10 p-5 border border-gray-200 bg-gray-50 rounded-lg">
                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Banking Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Account Name:</strong> Bonram (Pty) Ltd</div>
                            <div><strong>Bank:</strong> FNB</div>
                            <div><strong>Account Number:</strong> 123456789</div>
                            <div><strong>Branch Code:</strong> 250655</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#1e3a5f] rounded flex items-center justify-center">
                            <span className="text-white font-bold text-[10px]">B</span>
                        </div>
                        <span className="text-xs text-gray-400">Bonram (Pty) Ltd | Premium Event Equipment Rentals</span>
                    </div>
                </div>
                <div className="h-1.5" style={{ background: "#d4af37" }} />
            </div>
        </>
    );
}
