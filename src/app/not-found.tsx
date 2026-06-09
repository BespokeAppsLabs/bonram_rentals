import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[65vh] bg-mist flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gold uppercase tracking-widest text-sm font-semibold mb-3">404</p>
          <h1 className="text-4xl font-heading font-bold text-navy mb-3">Page not found</h1>
          <p className="text-gray mb-6">Browse available equipment or return to the homepage.</p>
          <div className="flex gap-3 justify-center">
            <a href="/catalog"><Button variant="gold">Browse Equipment</Button></a>
            <a href="/"><Button variant="outline">Home</Button></a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
