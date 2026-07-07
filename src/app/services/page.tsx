import { PublicPage } from "@/components/layout/public-page";

const services = [
  ["Event equipment hire", "Tents, seating, tables, artificial grass, mobile freezers, sound, lighting, and power for private and institutional events."],
  ["Premium sanitation", "Professionally cleaned portable and VIP toilet facilities, delivered and positioned for guest comfort."],
  ["Logistics and setup", "Reliable transport, installation, setup support, and collection managed by an experienced local team."],
  ["Corporate and government support", "Scalable event solutions backed by a track record serving major South African institutions."],
  ["Shuttle services", "Coordinated transport solutions for guests, teams, and event stakeholders."],
  ["Power and technical support", "Generators, sound systems, stages, and lighting for reliable event operations."],
];

export default function ServicesPage() {
  return (
    <PublicPage eyebrow="Complete Event Support" title="Reliable equipment. Professional delivery. One accountable team." intro="From intimate family events to large government functions, Bonram coordinates equipment, logistics, and support with institutional-grade care.">
      <div className="grid md:grid-cols-2 gap-6">
        {services.map(([title, description]) => (
          <article key={title} className="border border-gray-light p-6 rounded-lg hover:border-gold transition-colors">
            <h2 className="text-xl font-heading font-bold text-navy mb-3">{title}</h2>
            <p className="text-gray">{description}</p>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}
