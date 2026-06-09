"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const sendQuoteSubmitted = internalAction({
  args: {
    publicReference: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    location: v.string(),
    startDate: v.number(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { sent: false, reason: "RESEND_API_KEY missing" };
    const resend = new Resend(apiKey);
    const from = process.env.QUOTE_FROM_EMAIL ?? "Bonram Rentals <quotes@bonramrentals.co.za>";
    const staffEmail = process.env.QUOTE_ALERT_EMAIL ?? "info@bonramrentals.co.za";
    const eventDate = new Date(args.startDate).toLocaleDateString("en-ZA");

    const name = escapeHtml(args.customerName);
    const email = escapeHtml(args.customerEmail);
    const phone = escapeHtml(args.customerPhone);
    const location = escapeHtml(args.location);
    const ref = escapeHtml(args.publicReference);

    const [customerResult, staffResult] = await Promise.all([
      resend.emails.send({
        from,
        to: args.customerEmail,
        subject: `Quote request received — ${ref}`,
        html: `<h1>Thank you, ${name}</h1><p>We received your Bonram Rentals quote request.</p><p><strong>Reference:</strong> ${ref}<br/><strong>Event date:</strong> ${eventDate}<br/><strong>Location:</strong> ${location}</p><p>Our team will review availability and contact you shortly.</p>`,
      }),
      resend.emails.send({
        from,
        to: staffEmail,
        subject: `New quote request — ${ref}`,
        html: `<h1>New qualified quote request</h1><p><strong>${name}</strong><br/>${email}<br/>${phone}</p><p><strong>Event date:</strong> ${eventDate}<br/><strong>Location:</strong> ${location}</p><p>Open the Bonram admin dashboard to review it.</p>`,
      }),
    ]);

    if (customerResult.error || staffResult.error) {
      console.error("[notifications] Resend delivery error", {
        customer: customerResult.error,
        staff: staffResult.error,
      });
      return { sent: false, reason: "Resend delivery error" };
    }

    return { sent: true };
  },
});
