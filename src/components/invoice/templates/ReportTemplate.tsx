"use client";

import React from 'react';
import { TemplateProps } from './template-types';

export const ReportTemplate: React.FC<TemplateProps> = ({
    data,
    pageItems,
    pageNumber,
    totalPages,
    isLastPage
}) => {
    const { customerContact, invoiceNumber } = data;

    return (
        <div className="bg-slate-100 flex flex-col gap-8 p-8 items-center min-h-[600px] overflow-y-auto w-full">
            {/* Page 1: Cover or Initial Content */}
            {pageNumber === 1 && (
                <article className="relative bg-white h-[297mm] w-[210mm] shadow-2xl flex flex-col overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-navy/80 mix-blend-multiply z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=2070&auto=format&fit=crop"
                        alt="Cover Background"
                        className="absolute inset-0 w-full h-full object-cover grayscale"
                    />

                    <div className="relative z-20 p-20 flex flex-col h-full text-white">
                        <img src="/Bonram-Logo-Transparent.png" alt="Bonram Logo" className="w-32 h-auto mb-auto" />

                        <div className="mt-20">
                            <div className="text-[10px] font-black tracking-widest text-gold uppercase mb-4 px-4 py-1.5 bg-white/10 backdrop-blur-md inline-block rounded-full">
                                Project Document
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8">
                                {data.notes || "FORMAL REPORT"}
                            </h1>

                            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/20">
                                <div>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Prepared for:</span>
                                    <strong className="text-lg uppercase tracking-tight">{customerContact.name}</strong>
                                    <p className="text-sm text-white/60">{customerContact.company}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Reference NO:</span>
                                    <strong className="text-lg uppercase tracking-tight">{invoiceNumber}</strong>
                                    <p className="text-sm text-white/60">{new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            )}

            {/* Content Pages */}
            {(pageNumber > 1 || totalPages === 1) && (
                <article className="bg-white h-[297mm] w-[210mm] shadow-2xl flex flex-col p-16 shrink-0 font-sans border-t-8 border-navy">
                    <header className="flex justify-between items-start mb-20">
                        <div className="space-y-4">
                            <div className="h-1.5 w-12 bg-gold rounded-full" />
                            <h1 className="text-4xl font-black text-navy tracking-tighter uppercase">
                                {pageNumber === 1 ? "Executive Summary" : `Project Details (Part ${pageNumber - 1})`}
                            </h1>
                        </div>
                        <div className="flex flex-col items-end">
                            <img src="/Logo.png" alt="Bonram Logo" className="w-24 h-auto mb-2" />
                            <div className="text-[10px] font-black text-navy bg-gold/10 px-3 py-1 rounded">
                                PAGE {pageNumber} OF {totalPages}
                            </div>
                        </div>
                    </header>

                    <div className="flex-grow">
                        {pageNumber === 2 || totalPages === 1 ? (
                            <div className="space-y-8">
                                <h3 className="text-xl font-black text-navy uppercase tracking-tight border-b-2 border-mist pb-2">Project Roadmap</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div key={step} className="flex gap-6 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-full border-2 border-mist flex items-center justify-center text-sm font-bold text-navy bg-white group-hover:border-gold transition-colors">
                                                    0{step}
                                                </div>
                                                <div className="w-0.5 flex-grow bg-mist mt-2 group-last:hidden" />
                                            </div>
                                            <div className="pb-8">
                                                <h3 className="text-lg font-black text-navy mb-1 uppercase tracking-tight">Phase 0{step} Objectives</h3>
                                                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                                                    Development and implementation of core strategic initiatives associated with this project phase.
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-600 leading-relaxed">
                                <p>Additional content for page {pageNumber}...</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-navy p-8 rounded-3xl text-white flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Status</span>
                                <span className="font-bold text-gold uppercase tracking-tighter text-sm">Active Project</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Priority</span>
                                <span className="font-bold text-white uppercase tracking-tighter text-sm">High Strategic</span>
                            </div>
                        </div>
                        <img src="/Bonram-Logo-Transparent.png" alt="Logo" className="w-16 h-auto opacity-50" />
                    </div>
                </article>
            )}
        </div>
    );
};
