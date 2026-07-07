"use client";

import { Button } from "@/components/ui";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-mist flex items-center justify-center px-4">
      <div className="max-w-lg bg-white border border-gray-light rounded-lg p-8 text-center">
        <p className="text-gold uppercase tracking-widest text-sm font-semibold mb-3">Temporary issue</p>
        <h1 className="text-3xl font-heading font-bold text-navy mb-3">We could not load this page.</h1>
        <p className="text-gray mb-6">Try again, or call Bonram on 074 274 8684 if you need immediate assistance.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gold" onClick={reset}>Try Again</Button>
          <a href="tel:+27742748684"><Button variant="outline">Call Bonram</Button></a>
        </div>
      </div>
    </main>
  );
}
