"use client";

import React from 'react';
import { DocumentData, DocumentType, TemplateStyle, LineItem } from '@/types/document';
import { Upload, Sliders, Layers, Layout, Eye, Trash2, Plus, ListOrdered, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
    data: DocumentData;
    onChange: (data: Partial<DocumentData>) => void;
    onPreviewClick?: () => void;
    products?: any[];
}

export const DocumentForm: React.FC<Props> = ({ data, onChange, onPreviewClick, products = [] }) => {

    // Line Item Actions
    const addLineItem = () => {
        const newItem: LineItem = {
            id: crypto.randomUUID(),
            description: '',
            uom: 'unit',
            quantity: 1,
            unitPrice: 0,
            total: 0
        };
        onChange({ lineItems: [...(data.lineItems || []), newItem] });
    };

    const updateLineItem = (id: string, updates: Partial<LineItem>) => {
        const updatedItems = data.lineItems.map(item => {
            if (item.id === id) {
                const newItem = { ...item, ...updates };
                newItem.total = (newItem.quantity || 0) * (newItem.unitPrice || 0);
                return newItem;
            }
            return item;
        });
        onChange({ lineItems: updatedItems });
    };

    const removeLineItem = (id: string) => {
        onChange({ lineItems: data.lineItems.filter(item => item.id !== id) });
    };

    const inputClasses = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none placeholder:text-slate-400 text-sm";

    return (
        <div className="space-y-6">
            {/* 1. Customer Details */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    <Info className="w-4 h-4 text-blue-600" />
                    Customer Details
                </label>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={data.customerContact.name}
                        onChange={(e) => onChange({ customerContact: { ...data.customerContact, name: e.target.value } })}
                        className={inputClasses}
                    />
                    <input
                        type="email"
                        placeholder="Customer Email"
                        value={data.customerContact.email}
                        onChange={(e) => onChange({ customerContact: { ...data.customerContact, email: e.target.value } })}
                        className={inputClasses}
                    />
                    <textarea
                        placeholder="Customer Address"
                        value={data.customerContact.address || ''}
                        onChange={(e) => onChange({ customerContact: { ...data.customerContact, address: e.target.value } })}
                        rows={3}
                        className={`${inputClasses} resize-none`}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Customer Phone"
                            value={data.customerContact.phone}
                            onChange={(e) => onChange({ customerContact: { ...data.customerContact, phone: e.target.value } })}
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            placeholder="VAT Number"
                            value={data.customerContact.vatNumber || ''}
                            onChange={(e) => onChange({ customerContact: { ...data.customerContact, vatNumber: e.target.value } })}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </section>

            {/* 1.5. Logistics Info (Bonram Specific) */}
            {data.templateStyle === TemplateStyle.BONRAM_FINANCIAL && (
                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                        <Info className="w-4 h-4 text-blue-600" />
                        Logistics & PO Details
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Vendor No."
                            value={data.logistics?.vendorNo || ''}
                            onChange={(e) => onChange({ logistics: { ...data.logistics, vendorNo: e.target.value } })}
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            placeholder="PO Number"
                            value={data.logistics?.poNumber || ''}
                            onChange={(e) => onChange({ logistics: { ...data.logistics, poNumber: e.target.value } })}
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            placeholder="GR Number"
                            value={data.logistics?.grNumber || ''}
                            onChange={(e) => onChange({ logistics: { ...data.logistics, grNumber: e.target.value } })}
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            placeholder="Invoice No (Override)"
                            value={data.logistics?.invoiceNumber || ''}
                            onChange={(e) => onChange({ logistics: { ...data.logistics, invoiceNumber: e.target.value } })}
                            className={inputClasses}
                        />
                    </div>
                </section>
            )}

            {/* 2. Line Items Editor */}
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <ListOrdered className="w-4 h-4 text-gold" />
                        Line Items
                    </label>
                    <button
                        onClick={addLineItem}
                        className="p-1 px-3 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-3 h-3" /> Add Item
                    </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.lineItems.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No items added yet</p>
                        </div>
                    ) : (
                        data.lineItems.map((item, idx) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-300">#{idx + 1}</span>
                                        <select
                                            className={`${inputClasses} flex-1`}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "manual") return;
                                                const product = products.find(p => p._id === val);
                                                if (product) {
                                                    updateLineItem(item.id, {
                                                        description: product.name,
                                                        unitPrice: product.dailyRate || 0
                                                    });
                                                }
                                            }}
                                            value={products.find(p => p.name === item.description)?._id || "manual"}
                                        >
                                            <option value="manual">Manual Entry</option>
                                            <optgroup label="Product Catalog">
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <button
                                            onClick={() => removeLineItem(item.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Description override..."
                                        value={item.description}
                                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="col-span-1">
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <input
                                            type="text"
                                            placeholder="Unit"
                                            value={item.uom}
                                            onChange={(e) => updateLineItem(item.id, { uom: e.target.value })}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R</span>
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={item.unitPrice}
                                                onChange={(e) => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                                className={`${inputClasses} pl-6`}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Total</span>
                                    <span className="text-xs font-black text-navy">{formatCurrency(item.total)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* 3. Banking Details */}
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    <Info className="w-4 h-4 text-green-600" />
                    Banking Details
                </label>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Bank Name"
                        value={data.banking?.bankName || data.bankName || ''}
                        onChange={(e) => onChange({ banking: { ...data.banking, bankName: e.target.value, accountNumber: data.banking?.accountNumber || '', branchCode: data.banking?.branchCode || '' } })}
                        className={inputClasses}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Account Number"
                            value={data.banking?.accountNumber || data.accountNumber || ''}
                            onChange={(e) => onChange({ banking: { ...data.banking, bankName: data.banking?.bankName || '', accountNumber: e.target.value, branchCode: data.banking?.branchCode || '' } })}
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            placeholder="Branch Code"
                            value={data.banking?.branchCode || data.branchCode || ''}
                            onChange={(e) => onChange({ banking: { ...data.banking, bankName: data.banking?.bankName || '', accountNumber: data.banking?.accountNumber || '', branchCode: e.target.value } })}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </section>

            {/* 4. Template Selection */}
            <section className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Layout className="w-4 h-4 text-blue-600" />
                    Document Template
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {Object.values(TemplateStyle).map((style) => (
                        <button
                            key={style}
                            onClick={() => onChange({ templateStyle: style })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${data.templateStyle === style
                                ? 'border-gold bg-gold/5 text-gold shadow-sm'
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                }`}
                        >
                            <div className={`w-8 h-1 rounded-full mb-2 ${style === TemplateStyle.BONRAM_FINANCIAL ? 'bg-navy' :
                                style === TemplateStyle.BONRAM_LETTER ? 'bg-gold' :
                                    'bg-charcoal'
                                }`} />
                            <p className="text-[10px] font-black leading-tight uppercase tracking-tighter">{style}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Preview Button for Mobile */}
            <div className="md:hidden pt-4">
                <button
                    onClick={onPreviewClick}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <Eye className="w-5 h-5" />
                    Preview Live
                </button>
            </div>
        </div>
    );
};
