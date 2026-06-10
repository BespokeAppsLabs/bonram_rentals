import { PublicPage } from "@/components/layout/public-page";

export default function TermsPage() {
  return (
    <PublicPage eyebrow="Terms" title="Clear expectations before equipment is confirmed." intro="Website estimates and quote requests help our team understand your needs. A rental becomes confirmed only after formal approval by Bonram.">
      <div className="text-gray space-y-5">
        <p>Displayed rates are starting estimates. Final pricing may include delivery, setup, staffing, taxes, deposits, location requirements, and approved discounts.</p>
        <p>Equipment remains subject to availability until a formal quotation is accepted and the required confirmation process is completed.</p>
        <p>Customers must provide accurate event dates, location, quantities, access requirements, and contact details.</p>
        <p>Formal quotations and rental agreements contain the binding commercial, cancellation, damage, collection, and payment terms.</p>
      </div>
    </PublicPage>
  );
}
