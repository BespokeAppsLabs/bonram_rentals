"use client";

import React from 'react';
import { TemplateProps } from './template-types';
import { format } from 'date-fns';

export const LetterTemplate: React.FC<TemplateProps> = ({
    data,
    pageItems,
    pageNumber,
    totalPages,
    isLastPage
}) => {
    const { customerContact, issuedDate, invoiceNumber } = data;

    return (
        <article className="bg-white min-h-[297mm] w-[210mm] p-0 flex flex-col font-sans text-slate-900 border shadow-lg mx-auto print:shadow-none print:border-none">
            {/* Header Line */}
            <div className="h-2 bg-navy w-full" />

            <div className="px-16 pt-16 flex-grow flex flex-col">
                <header className="flex justify-between items-start mb-20">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black tracking-widest text-gold uppercase px-3 py-1 bg-navy/5 inline-block rounded">
                            Business Correspondence
                        </div>
                        <h1 className="text-4xl font-black text-navy tracking-tighter">OFFICIAL LETTER</h1>
                    </div>
                    <img src="/Logo.png" alt="Bonram Logo" className="w-24 h-auto" />
                </header>

                <div className="flex justify-between mb-16">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">To:</span>
                        <div className="text-sm">
                            <strong className="text-navy uppercase tracking-tight">{customerContact.name}</strong><br />
                            {customerContact.company && <div className="text-slate-500">{customerContact.company}</div>}
                            <div className="text-slate-500 whitespace-pre-line">{customerContact.address || "No Address Provided"}</div>
                        </div>
                    </div>
                    <div className="text-right space-y-4">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date:</span>
                            <strong className="text-sm text-navy">{format(issuedDate, 'dd MMMM yyyy')}</strong>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference:</span>
                            <strong className="text-sm text-navy">{invoiceNumber}</strong>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="text-sm font-black text-navy uppercase tracking-tight pb-4 border-b border-mist">
                        RE: {data.notes || "Official Correspondence"}
                    </div>
                </div>

                <div className="text-sm leading-relaxed text-slate-700 min-h-[300px]">
                    <p className="mb-6">Dear {customerContact.name.split(' ')[0]},</p>
                    <div className="whitespace-pre-line">
                        {data.notes ? data.notes : "This letter serves as official correspondence from Bonram (Pty) Ltd. Further details regarding the subject matter will be discussed in subsequent communications."}
                    </div>
                </div>

                {isLastPage && (
                    <div className="mt-20">
                        <p className="text-sm text-slate-500 mb-8">Sincerely,</p>
                        <div className="space-y-1">
                            <div className="font-bold text-navy">Bonram Administration</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bonram (Pty) Ltd</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-16 pb-12 mt-auto">
                <div className="flex items-center justify-between pt-8 border-t border-mist">
                    <div className="flex items-center gap-4">
                        <img src="/Logo.png" alt="Bonram Logo" className="w-16 h-auto grayscale opacity-30" />
                        <div className="text-[10px] font-black text-navy bg-gold/10 px-3 py-1 rounded">
                            PAGE {pageNumber} OF {totalPages}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Bonram (Pty) Ltd | Level 1 BBBEE
                        </div>
                        <div className="text-[10px] font-bold text-gold">www.bonram.co.za</div>
                    </div>
                </div>
            </div>

            {/* Footer Line */}
            <div className="h-1 bg-gold w-full mt-4" />
        </article>
    );
};
