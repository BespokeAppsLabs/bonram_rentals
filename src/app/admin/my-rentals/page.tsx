"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { formatCurrency } from "@/lib/utils";
import { Loader2, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: "Draft", color: "bg-gray/10 text-gray", icon: Clock },
    pending_review: { label: "Pending", color: "bg-gold/10 text-gold", icon: Clock },
    reviewing: { label: "Reviewing", color: "bg-blue-50 text-blue-600", icon: Clock },
    sent_to_client: { label: "Sent", color: "bg-blue-50 text-blue-600", icon: FileText },
    confirmed: { label: "Confirmed", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600", icon: XCircle },
};

export default function MyRentalsPage() {
    // Use getUserSession for consistent auth handling
    const session = useQuery(api.users.getUserSession);
    const dbUser = session?.user;

    if (!session || !dbUser) {
        return (
            <div>
                <h1 className="text-2xl font-heading font-bold text-navy mb-6">My Rentals</h1>
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-heading font-bold text-navy mb-1">My Rentals</h1>
            <p className="text-gray text-sm mb-6">Your quotation and rental history</p>
            <RentalsList userId={dbUser._id} />
        </div>
    );
}

function RentalsList({ userId }: { userId: any }) {
    const allQuotations = useQuery(api.quotations.getByUser, { userId });

    if (!allQuotations) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>;
    }

    if (allQuotations.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-light p-8 text-center">
                <FileText className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                <p className="text-gray font-medium">No rentals yet</p>
                <p className="text-sm text-gray mt-1">Your quotation requests will appear here.</p>
                <a href="/catalog" className="inline-block mt-4 text-sm font-medium text-gold hover:text-gold/80">Browse Equipment →</a>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {allQuotations.map((q: any) => {
                const config = statusConfig[q.status] ?? statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                    <div key={q._id} className="bg-white rounded-xl border border-gray-light p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium text-navy">{q.eventDetails?.location ?? "Event"}</p>
                                <p className="text-sm text-gray mt-0.5">
                                    {new Date(q.eventDetails?.startDate).toLocaleDateString()} — {new Date(q.eventDetails?.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray">{q.eventDetails?.guestCount} guests</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                    <StatusIcon className="w-3 h-3" /> {config.label}
                                </span>
                                <p className="text-sm font-medium text-navy mt-2">{formatCurrency(q.total)}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
