"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

/**
 * Staff Sign-In Page
 * 
 * Staff enter their email. We check against the DB for admin/staff users.
 * If found, redirect to WorkOS auth with login_hint.
 * If not found, show generic "check your email" (no error leakage).
 */
export default function StaffSignInPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        // Always show "check your email" regardless of whether user exists
        // The server-side route will silently ignore unknown emails
        setSubmitted(true);

        // Redirect to the staff auth route which validates server-side
        window.location.href = `/api/auth/staff-signin?email=${encodeURIComponent(email.trim())}`;
    };

    return (
        <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">BONRAM RENTALS</h1>
                    <p className="text-white/60 text-sm mt-1">Staff Portal</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-[#1e3a5f] mb-1">Staff Access</h2>
                    <p className="text-gray-500 text-sm mb-8">Sign in with your corporate email to access the rentals management dashboard.</p>

                    <button
                        onClick={() => window.location.href = "/api/auth/staff-signin"}
                        className="w-full py-4 bg-[#1e3a5f] text-white rounded-xl font-semibold text-sm hover:bg-[#2c5a8f] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-navy/10"
                    >
                        Sign In to Admin Portal
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>

                    <p className="mt-8 text-xs text-gray-400 text-center uppercase tracking-widest font-medium">Institutional Luxury</p>
                </div>

                <div className="text-center mt-6">
                    <a href="/" className="text-white/50 text-sm hover:text-white/80 transition-colors">← Back to website</a>
                </div>
            </div>
        </div>
    );
}
