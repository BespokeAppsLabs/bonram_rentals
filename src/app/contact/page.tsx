import { PublicPage } from "@/components/layout/public-page";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <PublicPage eyebrow="Speak to Our Team" title="Responsive local support for your next event." intro="Contact Bonram for availability, urgent equipment needs, procurement questions, or help planning the right equipment mix.">
      <div className="grid md:grid-cols-3 gap-6">
        <a href="tel:+27742748684" className="border border-gray-light rounded-lg p-6 hover:border-gold transition-colors">
          <Phone className="text-gold mb-4" /><h2 className="font-heading font-bold text-navy text-xl mb-2">Call</h2><p className="text-gray">074 274 8684</p>
        </a>
        <a href="mailto:rentals@bonram.co.za" className="border border-gray-light rounded-lg p-6 hover:border-gold transition-colors">
          <Mail className="text-gold mb-4" /><h2 className="font-heading font-bold text-navy text-xl mb-2">Email</h2><p className="text-gray">rentals@bonram.co.za</p>
        </a>
        <div className="border border-gray-light rounded-lg p-6">
          <MapPin className="text-gold mb-4" /><h2 className="font-heading font-bold text-navy text-xl mb-2">Service Area</h2><p className="text-gray">Lephalale, Limpopo and projects across South Africa</p>
        </div>
      </div>
    </PublicPage>
  );
}
