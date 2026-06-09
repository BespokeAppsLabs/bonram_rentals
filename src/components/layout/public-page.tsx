import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";

export function PublicPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>
        <section className="bg-navy text-white py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-gold uppercase tracking-[0.22em] text-sm font-semibold mb-4">{eyebrow}</p>
            <h1 className="text-4xl md:text-6xl font-heading font-bold max-w-4xl mb-6">{title}</h1>
            <p className="text-mist text-lg md:text-xl max-w-3xl">{intro}</p>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">{children}</div>
        </section>
        <section className="py-16 bg-mist border-t border-gray-light">
          <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold text-navy mb-2">Plan with proven professionals</h2>
              <p className="text-gray">Tell us what your event needs. Our team will confirm availability and prepare a formal quote.</p>
            </div>
            <a href="/catalog">
              <Button variant="gold" size="lg">Browse Equipment <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
