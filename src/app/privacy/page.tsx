import { PublicPage } from "@/components/layout/public-page";

export default function PrivacyPage() {
  return (
    <PublicPage eyebrow="Privacy" title="Your information supports your quote and service delivery." intro="Bonram collects only information needed to respond to inquiries, prepare quotes, coordinate rentals, and meet legal obligations.">
      <div className="prose max-w-none text-gray space-y-5">
        <p>Information may include contact details, company details, event location, dates, guest count, selected equipment, and communications with our team.</p>
        <p>We use this information to provide quotations, confirm availability, deliver services, issue documents, improve operations, and meet accounting or legal requirements.</p>
        <p>We do not sell personal information. Access is limited to authorised staff and service providers needed to operate the platform.</p>
        <p>For access, correction, or deletion requests, email rentals@bonram.co.za.</p>
      </div>
    </PublicPage>
  );
}
