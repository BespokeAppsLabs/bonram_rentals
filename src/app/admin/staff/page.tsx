"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui";
import { UserPlus, Shield, ShieldCheck, Mail, X, Loader2, Clock } from "lucide-react";
import { useState } from "react";

export default function AdminStaffPage() {
    const users = useQuery(api.users.getAll);
    const pendingInvitations = useQuery(api.users.getPendingInvitations);
    const createInvitation = useMutation(api.users.createInvitation);
    const updateRole = useMutation(api.users.updateRole);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const staffUsers = users?.filter((u) => u.role === "admin" || u.role === "staff") ?? [];

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError("");
        try {
            const admin = users?.find((u) => u.role === "admin");
            if (!admin) { setError("No admin user found."); setSending(false); return; }
            await createInvitation({ email: inviteEmail, role: inviteRole, invitedBy: admin._id });
            setInviteEmail("");
            setShowInviteModal(false);
        } catch (err: any) {
            setError(err.message ?? "Failed to send invitation");
        } finally { setSending(false); }
    };

    const handleRoleToggle = async (userId: Id<"users">, currentRole: string) => {
        await updateRole({ id: userId, role: currentRole === "admin" ? "staff" : "admin" });
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy">Staff</h1>
                    <p className="text-gray mt-1">{staffUsers.length} team members</p>
                </div>
                <Button variant="gold" size="md" onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Staff
                </Button>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl border border-gray-light overflow-hidden mb-8">
                {!users ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
                ) : staffUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray">No staff members yet.</div>
                ) : (
                    <div className="divide-y divide-gray-light">
                        {staffUsers.map((user) => (
                            <div key={user._id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
                                        <span className="text-navy font-bold text-sm">{user.name[0]?.toUpperCase() ?? "?"}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-navy">{user.name}</p>
                                        <p className="text-sm text-gray">{user.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleRoleToggle(user._id, user.role)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-gold/10 text-gold" : "bg-navy/5 text-navy"}`}>
                                    {user.role === "admin" ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Invitations */}
            {pendingInvitations && pendingInvitations.length > 0 && (
                <div>
                    <h2 className="text-xl font-heading font-semibold text-navy mb-4">Pending Invitations</h2>
                    <div className="bg-white rounded-xl border border-gray-light divide-y divide-gray-light">
                        {pendingInvitations.map((inv) => (
                            <div key={inv._id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center"><Mail className="w-5 h-5 text-gold" /></div>
                                    <div>
                                        <p className="font-medium text-navy">{inv.email}</p>
                                        <p className="text-sm text-gray flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(inv.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gold bg-gold/10 px-3 py-1 rounded-full">{inv.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-bold text-navy">Invite Staff</h2>
                            <button onClick={() => setShowInviteModal(false)} className="p-1 text-gray hover:text-navy"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
                                <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@bonram.co.za" className="w-full px-4 py-2.5 border border-gray-light rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy mb-1.5">Role</label>
                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}
                                    className="w-full px-4 py-2.5 border border-gray-light rounded-lg bg-white focus:ring-2 focus:ring-gold/50">
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" size="md" type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                                <Button variant="gold" size="md" type="submit" disabled={sending}>
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-2" /> Send Invitation</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
