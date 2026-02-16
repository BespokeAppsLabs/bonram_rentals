import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { DocumentData, TemplateStyle } from '@/types/document';
import { format } from 'date-fns';
import { paginateItems } from '@/lib/pagination';

// Register a standard font if needed, but Helvetica is default and safe.
// We can use standard fonts for now.

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        position: 'relative',
        paddingBottom: 80, // Space for footer
    },
    // Decorative Lines
    topLineBlue: {
        width: '100%',
        height: 12,
        backgroundColor: '#1e3a5f',
    },
    topLineGold: {
        width: '100%',
        height: 6,
        backgroundColor: '#d4af37',
    },
    // Content Container
    content: {
        paddingHorizontal: 40,
        paddingTop: 20,
        flexGrow: 1,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'column',
        marginTop: 8,
    },
    docType: {
        fontSize: 10,
        color: '#64748b', // slate-500
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    docTitle: {
        fontSize: 24,
        color: '#1e3a5f',
        fontWeight: 'bold', // Helvetica-Bold
        textTransform: 'uppercase',
    },
    logo: {
        width: 160,
        height: 'auto',
        objectFit: 'contain',
    },
    // Metadata Banner
    metadataGrid: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc', // slate-50
        borderColor: '#f1f5f9', // slate-100
        borderWidth: 1,
        padding: 8,
        marginBottom: 8,
        gap: 16,
    },
    metadataItem: {
        flexDirection: 'column',
        width: '25%',
    },
    metaLabel: {
        fontSize: 9,
        color: '#94a3b8', // slate-400
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 10,
        color: '#334155', // slate-700
        fontWeight: 'bold',
    },
    metaValueLarge: {
        fontSize: 14,
        color: '#0f172a', // slate-900
        fontWeight: 'black',
    },
    // Logistics Bar
    logisticsBar: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0', // slate-200
        borderWidth: 1,
        padding: 8,
        marginBottom: 8,
        gap: 16,
    },
    // Address Section
    addressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 32,
    },
    addressBlock: {
        width: '48%',
    },
    addressLabel: {
        fontSize: 9,
        color: '#94a3b8',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 1.4,
    },
    companyName: {
        color: '#1e3a5f',
        fontWeight: 'bold',
        fontSize: 11,
        marginBottom: 2,
    },
    // Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginTop: 10,
    },
    tableHeaderCell: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    tableCell: {
        fontSize: 10,
        color: '#1e293b', // slate-800
    },
    // Widths
    colDesc: { width: '45%', textAlign: 'left' },
    colUom: { width: '10%', textAlign: 'center' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#1e3a5f' },

    // Totals
    totalsSection: {
        marginTop: 8,
        alignSelf: 'flex-end',
        width: '35%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    totalLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#64748b',
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 12,
        color: '#1e3a5f',
        fontWeight: 'bold',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingTop: 4,
        borderTopWidth: 2,
        borderTopColor: '#d4af37',
    },
    grandTotalValue: {
        fontSize: 14,
        color: '#1e3a5f',
        fontWeight: 'black',
    },

    // Banking
    bankingSection: {
        marginTop: 16,
        padding: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    bankingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    bankingItem: {
        width: '45%',
        flexDirection: 'row',
        fontSize: 10,
        color: '#334155',
    },
    bankingLabel: {
        fontWeight: 'bold',
        color: '#1e3a5f',
        marginRight: 4,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 8,
    },
    footerLogo: {
        height: 24,
        width: 'auto',
        opacity: 0.8,
    },
    footerRight: {
        alignItems: 'flex-end',
    },
    footerText: {
        fontSize: 9,
        color: '#94a3b8',
    },
    footerPage: {
        fontSize: 9,
        color: '#1e3a5f',
        fontWeight: 'bold',
    },
    footerLineGold: {
        width: '100%',
        height: 6,
        backgroundColor: '#d4af37',
    },
    footerLineBlue: {
        width: '100%',
        height: 12,
        backgroundColor: '#1e3a5f',
    },
    continued: {
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: 10,
        color: '#94a3b8',
        fontStyle: 'italic',
        paddingBottom: 20,
    }
});

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
    }).format(amount);
};

interface Props {
    data: DocumentData;
}

export const FinancialPdfTemplate: React.FC<Props> = ({ data }) => {
    const lineItemPages = paginateItems(data.lineItems || []);
    const totalPages = Math.max(lineItemPages.length, 1);

    // If no items, ensure we render at least one page
    if (lineItemPages.length === 0) {
        lineItemPages.push([]);
    }

    return (
        <Document>
            {lineItemPages.map((pageItems, index) => {
                const pageNumber = index + 1;
                const isLastPage = pageNumber === totalPages;

                return (
                    <Page key={pageNumber} size="A4" style={styles.page}>
                        {/* 1. Header Lines */}
                        <View style={styles.topLineBlue} />
                        <View style={styles.topLineGold} />

                        {/* 2. Main Content */}
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.docType}>{data.type}</Text>
                                    <Text style={styles.docTitle}>
                                        {data.type === 'Tax Invoice' ? 'TAX INVOICE' : 'QUOTATION'}
                                    </Text>
                                </View>
                                {/* Need absolute URL or base64 for PDF images. Assuming public folder access works or we need base64 */}
                                {/* React-pdf supports http/https urls if allowed, or local paths in node. 
                                    For client-side generation, standard public URL should work if accessible */}
                                <Image src="/bonram-rentals-logo.jpeg" style={styles.logo} />
                            </View>

                            {/* Metadata */}
                            <View style={styles.metadataGrid}>
                                <View style={styles.metadataItem}>
                                    <Text style={styles.metaLabel}>Document Number</Text>
                                    <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
                                </View>
                                <View style={styles.metadataItem}>
                                    <Text style={styles.metaLabel}>Issue Date</Text>
                                    <Text style={styles.metaValue}>{format(data.issuedDate, 'dd/MM/yyyy')}</Text>
                                </View>
                                <View style={styles.metadataItem}>
                                    <Text style={styles.metaLabel}>Valid Until</Text>
                                    <Text style={styles.metaValue}>{format(data.dueDate, 'dd/MM/yyyy')}</Text>
                                </View>
                                <View style={styles.metadataItem}>
                                    <Text style={styles.metaLabel}>Currency</Text>
                                    <Text style={styles.metaValueLarge}>ZAR</Text>
                                </View>
                            </View>

                            {/* Logistics */}
                            {data.logistics && (
                                <View style={styles.logisticsBar}>
                                    <View style={styles.metadataItem}>
                                        <Text style={styles.metaLabel}>Vendor No</Text>
                                        <Text style={styles.metaValue}>{data.logistics.vendorNo || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.metadataItem}>
                                        <Text style={styles.metaLabel}>PO Number</Text>
                                        <Text style={styles.metaValue}>{data.logistics.poNumber || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.metadataItem}>
                                        <Text style={styles.metaLabel}>GR Number</Text>
                                        <Text style={styles.metaValue}>{data.logistics.grNumber || 'N/A'}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Addresses */}
                            <View style={styles.addressSection}>
                                <View style={styles.addressBlock}>
                                    <Text style={styles.addressLabel}>Billed From</Text>
                                    <Text style={styles.companyName}>Bonram (Pty) Ltd</Text>
                                    <Text style={styles.addressText}>Reg: 2021/654321/07</Text>
                                    <Text style={styles.addressText}>VAT: 41234567890</Text>
                                    <Text style={styles.addressText}>Lephalale, Limpopo</Text>
                                    <Text style={styles.addressText}>South Africa</Text>
                                </View>
                                <View style={styles.addressBlock}>
                                    <Text style={styles.addressLabel}>Billed To</Text>
                                    <Text style={styles.companyName}>{data.customerContact.name}</Text>
                                    {data.customerContact.company && (
                                        <Text style={styles.addressText}>{data.customerContact.company}</Text>
                                    )}
                                    <Text style={styles.addressText}>{data.customerContact.address || data.customerContact.email}</Text>
                                    {data.customerContact.vatNumber && (
                                        <Text style={styles.addressText}>VAT: {data.customerContact.vatNumber}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
                                <Text style={[styles.tableHeaderCell, styles.colUom]}>UOM</Text>
                                <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
                                <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
                                <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total Price</Text>
                            </View>

                            {/* Table Rows */}
                            {pageItems.map((item, idx) => (
                                <View key={item.id || idx} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                                    <Text style={[styles.tableCell, styles.colUom]}>{item.uom || 'Unit'}</Text>
                                    <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                                    <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unitPrice || 0)}</Text>
                                    <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total)}</Text>
                                </View>
                            ))}

                            {/* Totals (Last Page Only) */}
                            {isLastPage && (
                                <View style={styles.totalsSection}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Subtotal</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>VAT (15%)</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(data.vatAmount)}</Text>
                                    </View>
                                    <View style={styles.grandTotalRow}>
                                        <Text style={styles.grandTotalValue}>Total Due</Text>
                                        <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Banking (Last Page Only) */}
                            {isLastPage && (
                                <View style={styles.bankingSection}>
                                    <Text style={styles.addressLabel}>Banking Details</Text>
                                    <View style={styles.bankingGrid}>
                                        <View style={styles.bankingItem}>
                                            <Text style={styles.bankingLabel}>Account Name:</Text>
                                            <Text>Bonram (Pty) Ltd</Text>
                                        </View>
                                        <View style={styles.bankingItem}>
                                            <Text style={styles.bankingLabel}>Bank:</Text>
                                            <Text>{data.banking?.bankName || data.bankName || 'First National Bank'}</Text>
                                        </View>
                                        <View style={styles.bankingItem}>
                                            <Text style={styles.bankingLabel}>Account Number:</Text>
                                            <Text>{data.banking?.accountNumber || data.accountNumber || '62406454786'}</Text>
                                        </View>
                                        <View style={styles.bankingItem}>
                                            <Text style={styles.bankingLabel}>Branch Code:</Text>
                                            <Text>{data.banking?.branchCode || data.branchCode || '210755'}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {!isLastPage && (
                                <Text style={styles.continued}>Continued on next page...</Text>
                            )}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <View style={styles.footerContent}>
                                <Image src="/bonram-rentals-logo.jpeg" style={styles.footerLogo} />
                                <View style={styles.footerRight}>
                                    <Text style={styles.footerText}>Bonram (Pty) Ltd | Bridging the Digital Divide</Text>
                                    <Text style={styles.footerPage}>{`Page ${pageNumber} of ${totalPages}`}</Text>
                                </View>
                            </View>
                            <View style={styles.footerLineGold} />
                            <View style={styles.footerLineBlue} />
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};
