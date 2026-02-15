import { cn } from "@/lib/utils";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

// ============================================
// FOOTER COMPONENT
// Institutional Luxury Design
// ============================================

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-navy text-white", className)}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-20 w-auto">
                <img
                  src="/bonram-rentals-logo.jpeg"
                  alt="Bonram Rentals"
                  className="h-full w-auto object-contain brightness-0 invert"
                />
              </div>
            </div>
            <p className="text-mist text-sm mb-4">
              Presidential-grade event equipment hire trusted by South Africa's biggest institutions.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="/catalog">Equipment Catalog</FooterLink>
              <FooterLink href="/coming-soon">Our Services</FooterLink>
              <FooterLink href="/coming-soon">About Us</FooterLink>
              <FooterLink href="/quote">Request Quote</FooterLink>
            </ul>
          </div>

          {/* Equipment Categories */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white uppercase tracking-wider">Equipment</h3>
            <ul className="space-y-2">
              <FooterLink href="/catalog?category=Sanitation">Sanitation</FooterLink>
              <FooterLink href="/catalog?category=Structures">Tents & Structures</FooterLink>
              <FooterLink href="/catalog?category=Power">Power Solutions</FooterLink>
              <FooterLink href="/catalog?category=Audio">Sound Systems</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <a href="tel:+27742748684" className="text-white hover:text-gold transition-colors">
                    074 274 8684
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gold mt-0.5" />
                <a href="mailto:info@bonram.co.za" className="text-white hover:text-gold transition-colors">
                  info@bonram.co.za
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5" />
                <span className="text-mist">
                  Lephalale, Limpopo<br />
                  South Africa
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Solid Border */}
      <div className="border-t border-mist">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-mist text-sm">
              © {new Date().getFullYear()} Bonram (Pty) Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/coming-soon" className="text-mist hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/coming-soon" className="text-mist hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-mist hover:text-gold transition-colors text-sm"
      >
        {children}
      </a>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-10 h-10 bg-mist rounded-lg flex items-center justify-center text-navy hover:bg-gold hover:text-white transition-all"
    >
      {icon}
    </a>
  );
}

export default Footer;
