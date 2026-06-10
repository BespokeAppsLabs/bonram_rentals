"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    // Use getUserSession for consistent auth handling
    const session = useQuery(api.users.getUserSession);
    const dbUser = session?.user;
    const updateProfile = useMutation(api.users.updateProfile);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState({
        name: "", phone: "", company: "", address: "", vatNumber: "",
    });

    useEffect(() => {
        if (dbUser) {
            setForm({
                name: dbUser.name ?? "",
                phone: dbUser.phone ?? "",
                company: dbUser.company ?? "",
                address: dbUser.address ?? "",
                vatNumber: dbUser.vatNumber ?? "",
            });
        }
    }, [dbUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dbUser) return;
        setSaving(true);
        setSaved(false);
        try {
            await updateProfile({ id: dbUser._id, ...form });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!dbUser) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-heading font-bold text-navy mb-1">My Profile</h1>
            <p className="text-gray text-sm mb-6">Your details will populate invoices automatically.</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-light p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-navy mb-1">Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-navy mb-1">Email</label>
                    <input type="email" value={dbUser.email} disabled
                        className="w-full px-4 py-2.5 border border-gray-light rounded-lg bg-mist text-gray cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-navy mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="074 274 8684" className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-navy mb-1">Company</label>
                    <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Company name" className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-navy mb-1">Address</label>
                    <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Street, City, Province" className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-navy mb-1">VAT Number</label>
                    <input type="text" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
                        placeholder="Optional" className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-light">
                    {saved && <span className="flex items-center gap-1 text-sm text-emerald-600"><CheckCircle className="w-4 h-4" /> Saved</span>}
                    <Button variant="gold" size="md" type="submit" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
