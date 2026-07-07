// ============================================
// CLIENT LOGO STRIP — "Trusted By" marquee
// Institutional Luxury Design
// ============================================

const clients: { name: string; logo?: string }[] = [
  { name: "Eskom", logo: "/logo/partner_logo/Eskom.png" },
  { name: "EXXARO", logo: "/logo/partner_logo/exxaro.png" },
  { name: "Enel Green Power", logo: "/logo/partner_logo/enel.jpeg" },
  { name: "ArcelorMittal SA", logo: "/logo/partner_logo/arcelormittal.png" },
  { name: "Eskom Rotek Industries", logo: "/logo/partner_logo/rotek.jpeg" },
  { name: "Ledjadja Coal", logo: "/logo/partner_logo/ledjadja_coal.jpg" },
  { name: "Agricultural Research Council", logo: "/logo/partner_logo/agri_research_council.png" },
  { name: "Lephalale Municipality", logo: "/logo/partner_logo/Lephalale_municipal.jpeg" },
  { name: "SAPS", logo: "/logo/partner_logo/SAPS.png" },
  { name: "Limpopo Legislature", logo: "/logo/partner_logo/limpopo_legislature.png" },
  { name: "TWF Corporate", logo: "/logo/partner_logo/TWF_corp.png" },
  { name: "Ankole Communications JV", logo: "/logo/partner_logo/ankole_comms.jpeg" },
];

export function ClientLogoStrip() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-gray-light overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold mb-3">
          Trusted By
        </p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
          South Africa&apos;s Leading Organisations
        </h2>
        <p className="text-gray max-w-2xl mx-auto">
          From national SOEs to provincial government departments, our clients
          represent the backbone of South African industry.
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-track flex gap-5 w-max px-5">
          {[...clients, ...clients].map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              className="flex-shrink-0 flex flex-col items-center justify-between gap-3 w-40 h-28 bg-mist rounded-lg border border-gray-light px-4 py-4 hover:border-gold transition-colors duration-200"
            >
              <div className="flex items-center justify-center flex-1 w-full">
                {client.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    className="object-contain max-h-10 w-auto"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center">
                    <span className="text-gold font-bold text-lg leading-none">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold text-gray text-center leading-tight line-clamp-2 w-full">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center mt-8 text-gray text-sm px-4">
        + 14 more clients across government, energy, mining, and corporate sectors.
      </p>
    </section>
  );
}

export default ClientLogoStrip;
