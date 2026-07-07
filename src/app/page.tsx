"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero/hero-section";
import { ClientLogoStrip } from "@/components/home/client-logo-strip";
import { Button, Card, CardBody } from "@/components/ui";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowRight, CheckCircle, Users, Building2, Calendar, Loader2 } from "lucide-react";

// ============================================
// HOMEPAGE
// Bonram Rentals Portal
// ============================================

export default function HomePage() {
  const products = useQuery(api.products.getAll);
  const featured = products?.slice(0, 3);

  return (
    <>
      <Header />

      {/* Hero Section with Integrated Search */}
      <HeroSection />

      {/* Featured Equipment Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              Featured Equipment
            </h2>
            <p className="text-gray max-w-2xl mx-auto">
              Our most popular items for events of all sizes. Browse our full catalog for more options.
            </p>
          </div>

          {/* Loading State */}
          {!featured && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          )}

          {/* Products from Convex */}
          {featured && featured.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <FeaturedEquipmentCard
                  key={product._id}
                  name={product.name}
                  category={product.category}
                  imageUrl={product.imageUrl}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {featured && featured.length === 0 && (
            <p className="text-center text-gray py-8">
              Equipment catalog coming soon.
            </p>
          )}

          <div className="text-center mt-10">
            <a href="/catalog">
              <Button variant="outline" size="lg">
                View Full Catalog
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-mist">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              Why Choose Bonram?
            </h2>
            <p className="text-gray max-w-2xl mx-auto">
              We bring institutional-grade reliability to every event, from intimate gatherings to large-scale functions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WhyChooseCard
              icon={<Building2 className="w-8 h-8" />}
              title="Institutional Trust"
              description="Trusted by Eskom, ArcelorMittal, and government departments since 2013."
            />
            <WhyChooseCard
              icon={<Users className="w-8 h-8" />}
              title="Any Event Size"
              description="From 50 to 5,000+ guests - we have the capacity and expertise."
            />
            <WhyChooseCard
              icon={<Calendar className="w-8 h-8" />}
              title="Reliable Delivery"
              description="On-time delivery and setup, every time. Your event success is our priority."
            />
            <WhyChooseCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Quality Assured"
              description="All equipment professionally maintained and cleaned to the highest standards."
            />
          </div>
        </div>
      </section>

      {/* Trusted By - Client Logo Marquee */}
      <ClientLogoStrip />

      {/* CTA Section - Solid Navy */}
      <section className="py-16 md:py-24 bg-navy border-t border-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-mist max-w-2xl mx-auto mb-8">
            Get a personalized quote for your event. Our team will help you select the right equipment
            for your needs and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/quote">
              <Button variant="gold" size="lg">
                Request a Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="tel:+27742748684">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">
                Call Us: 074 274 8684
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

// ============================================
// FEATURED EQUIPMENT CARD
// ============================================

interface FeaturedEquipmentCardProps {
  name: string;
  category: string;
  imageUrl?: string;
}

function FeaturedEquipmentCard({ name, category, imageUrl }: FeaturedEquipmentCardProps) {
  return (
    <Card hover className="group">
      <div className="relative aspect-video bg-mist overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-navy flex items-center justify-center">
            <span className="text-charcoal text-sm italic">No image available</span>
          </div>
        )}
      </div>
      <CardBody>
        <p className="text-sm text-gold font-medium mb-1">{category}</p>
        <h3 className="text-lg font-heading font-semibold text-navy mb-2">{name}</h3>
        <div className="flex items-center justify-end">
          <a href="/catalog">
            <Button variant="ghost" size="sm" className="group-hover:text-gold">
              View Details
            </Button>
          </a>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================
// WHY CHOOSE CARD
// ============================================

interface WhyChooseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function WhyChooseCard({ icon, title, description }: WhyChooseCardProps) {
  return (
    <Card className="text-center p-6">
      <div className="w-16 h-16 bg-mist rounded-sm flex items-center justify-center text-gold mx-auto mb-4 border border-gold">
        {icon}
      </div>
      <h3 className="text-lg font-heading font-semibold text-navy mb-2">{title}</h3>
      <p className="text-gray text-sm">{description}</p>
    </Card>
  );
}
