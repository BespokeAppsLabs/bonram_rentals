export enum DocumentType {
    INVOICE = 'Tax Invoice',
    QUOTATION = 'Quotation',
}

export enum TemplateStyle {
    BONRAM_FINANCIAL = 'Bonram Financial',
    BONRAM_LETTER = 'Official Letter',
    BONRAM_REPORT = 'Formal Report',
}

export interface LogoData {
    url?: string;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    scale: number;
    opacity: number;
    isBack: boolean;
    logoUrl?: string;
}

export interface LineItem {
    id: string;
    description: string;
    uom?: string;
    quantity: number;
    unitPrice?: number;
    total: number;
}

export interface DocumentData {
    id: string;
    type: DocumentType;
    templateStyle: TemplateStyle;
    invoiceNumber: string;
    issuedDate: number;
    dueDate: number;
    subtotal: number;
    vatAmount: number;
    total: number;
    status: string;
    customerContact: {
        name: string;
        email: string;
        phone: string;
        company?: string;
        address?: string;
        vatNumber?: string;
    };
    logistics?: {
        vendorNo?: string;
        poNumber?: string;
        grNumber?: string;
        invoiceNumber?: string;
    };
    lineItems: LineItem[];
    branding?: LogoData;
    notes?: string;
    banking?: {
        bankName: string;
        accountNumber: string;
        branchCode: string;
    };
    bankName?: string;
    accountNumber?: string;
    branchCode?: string;
}
