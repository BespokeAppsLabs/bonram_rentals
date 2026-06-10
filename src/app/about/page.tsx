import { PublicPage } from "@/components/layout/public-page";

const clients = ["Eskom Holdings", "Eskom Rotek Industries", "Exxaro Coal", "Enel Green Power", "ArcelorMittal South Africa", "Limpopo Provincial Government", "Agricultural Research Council", "National DPSA"];

export default function AboutPage() {
  return (
    <PublicPage eyebrow="Established 2013" title="Presidential-grade reliability for every event." intro="Bonram Rentals is a South African event and plant hire company trusted by public institutions, major businesses, and private hosts.">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy mb-4">Peace of mind through proven delivery</h2>
          <p className="text-gray mb-4">We built our reputation through punctual service, well-maintained equipment, responsive local support, and careful attention to hygiene and setup quality.</p>
          <p className="text-gray">BONRAM (PTY) LTD is registered in South Africa under registration number 2013/013325/07 and VAT number 4040296859.</p>
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy mb-5">Selected track record</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {clients.map((client) => <div key={client} className="bg-mist border-l-2 border-gold px-4 py-3 text-navy font-medium">{client}</div>)}
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
