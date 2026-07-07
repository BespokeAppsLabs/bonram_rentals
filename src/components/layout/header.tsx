"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Menu, X, Phone, LogIn, User } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

// ============================================
// HEADER COMPONENT
// Institutional Luxury Design
// ============================================

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white border-b border-gray-light",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 md:h-14 w-auto mix-blend-multiply">
              <Image
                src="/bonram-rentals-logo.jpeg"
                alt="Bonram Rentals"
                width={104}
                height={64}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/catalog">Equipment</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+27742748684"
              className="flex items-center gap-2 text-charcoal hover:text-navy transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">074 274 8684</span>
            </a>
            <a href="/quote">
              <Button variant="gold" size="md">
                Request Quote
              </Button>
            </a>
            {user ? (
              <a
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium text-navy hover:text-gold transition-colors"
              >
                <User className="w-4 h-4" />
                My Account
              </a>
            ) : (
              <a
                href="/sign-in"
                className="flex items-center gap-2 text-sm font-medium text-navy hover:text-gold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-charcoal hover:text-navy"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-light animate-slide-down">
            <nav className="flex flex-col gap-4">
              <MobileNavLink href="/catalog" onClick={() => setIsMenuOpen(false)}>
                Equipment
              </MobileNavLink>
              <MobileNavLink href="/services" onClick={() => setIsMenuOpen(false)}>
                Services
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>
                About
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </MobileNavLink>
              <div className="pt-4 border-t border-gray-light">
                <a
                  href="tel:+27742748684"
                  className="flex items-center gap-2 text-charcoal hover:text-navy transition-colors mb-4"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">074 274 8684</span>
                </a>
                <a href="/quote">
                  <Button variant="gold" size="md" className="w-full">
                    Request Quote
                  </Button>
                </a>
                {user ? (
                  <a
                    href="/admin"
                    className="flex items-center justify-center gap-2 mt-3 py-2 text-sm font-medium text-navy hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </a>
                ) : (
                  <a
                    href="/sign-in"
                    className="flex items-center justify-center gap-2 mt-3 py-2 text-sm font-medium text-navy hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================
// NAV LINK COMPONENTS
// ============================================

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-charcoal font-medium hover:text-navy transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-charcoal font-medium hover:text-navy transition-colors py-2"
    >
      {children}
    </Link>
  );
}

export default Header;
