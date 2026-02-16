"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import {
    FilePlus,
    FileText,
    Mail,
    BarChart,
    Plus,
    Loader2,
    Clock,
    ChevronRight,
    Search
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DocumentsHubPage() {
    const createStandalone = useMutation(api.quotations.createStandalone);
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const userSession = useQuery(api.users.getUserSession);
    const userId = userSession?.user?._id;

    // Fetch recent drafts/documents
    const recentQuotations = useQuery(api.quotations.getByUser,
        userId ? { userId: userId as any } : "skip"
    );

    const handleCreate = async (docType: "financial" | "letter" | "report") => {
        setCreating(true);
        try {
            const quotationId = await createStandalone({
                customerName: "New Draft",
                customerEmail: "draft@example.com",
            });

            // Redirect to studio with the selected template preset
            router.push(`/admin/quotations/${quotationId}/studio?template=${docType}`);
        } catch (error) {
            console.error("Failed to create document:", error);
            setCreating(false);
        }
    };

    const filteredDocs = recentQuotations?.filter(doc =>
        doc.customerContact.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-navy tracking-tight mb-2">Documents</h1>
                    <p className="text-gray text-lg">Create and manage professional correspondence</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray opacity-40" />
                        <input
                            type="text"
                            placeholder="Find a document..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-light rounded-xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none text-sm min-w-[280px] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Creation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <CreationCard
                    title="Financial Document"
                    description="Invoices, Quotations, and Pro-forma"
                    icon={<FileText className="w-8 h-8" />}
                    onClick={() => handleCreate("financial")}
                    primaryColor="bg-navy"
                    disabled={creating}
                />
                <CreationCard
                    title="Official Letter"
                    description="Professional business correspondence"
                    icon={<Mail className="w-8 h-8" />}
                    onClick={() => handleCreate("letter")}
                    primaryColor="bg-gold"
                    disabled={creating}
                />
                <CreationCard
                    title="Formal Report"
                    description="Full project or logistics reports"
                    icon={<BarChart className="w-8 h-8" />}
                    onClick={() => handleCreate("report")}
                    primaryColor="bg-charcoal"
                    disabled={creating}
                />
            </div>

            {/* Recent Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-navy">Recent Drafts</h2>
                    <Link href="/admin/invoices" className="text-sm font-bold text-gold hover:underline">
                        View All
                    </Link>
                </div>

                {!recentQuotations ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gold opacity-20" />
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-light p-12 text-center">
                        <div className="w-16 h-16 bg-mist rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-gray opacity-20" />
                        </div>
                        <p className="text-gray font-medium">No documents found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDocs.slice(0, 6).map((doc) => (
                            <Link
                                key={doc._id}
                                href={`/admin/quotations/${doc._id}/studio`}
                                className="group bg-white p-5 rounded-2xl border border-gray-light hover:border-gold hover:shadow-xl hover:shadow-navy/5 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-mist rounded-xl flex items-center justify-center text-navy group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-navy group-hover:text-gold transition-colors">
                                            {doc.customerContact.name || "Untitled Draft"}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray opacity-50 px-2 py-0.5 bg-mist rounded">
                                                {doc.status}
                                            </span>
                                            <span className="text-xs text-gray flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(doc.updatedAt)} ago
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CreationCard({ title, description, icon, onClick, primaryColor, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative bg-white p-8 rounded-[32px] border border-gray-light text-left hover:border-gold hover:shadow-2xl hover:shadow-navy/10 transition-all overflow-hidden"
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white ${primaryColor} shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-black text-navy mb-2">{title}</h3>
            <p className="text-sm text-gray leading-relaxed mb-6 opacity-60">
                {description}
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-navy group-hover:text-gold transition-colors">
                Start Creating <Plus className="w-4 h-4" />
            </div>

            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-mist rounded-full opacity-50 group-hover:scale-150 transition-transform -z-10" />
        </button>
    );
}
