import { SignIn } from "@clerk/nextjs";

export default function AdminSignInPage() {
    return (
        <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">BONRAM RENTALS</h1>
                    <p className="text-white/60 text-sm mt-1">Staff Portal</p>
                </div>
                <SignIn forceRedirectUrl="/admin" />
                <div className="text-center mt-6">
                    <a href="/" className="text-white/50 text-sm hover:text-white/80 transition-colors">← Back to website</a>
                </div>
            </div>
        </div>
    );
}
