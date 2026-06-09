"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

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

    await Promise.all([
      resend.emails.send({
        from,
        to: args.customerEmail,
        subject: `Quote request received — ${args.publicReference}`,
        html: `<h1>Thank you, ${args.customerName}</h1><p>We received your Bonram Rentals quote request.</p><p><strong>Reference:</strong> ${args.publicReference}<br/><strong>Event date:</strong> ${eventDate}<br/><strong>Location:</strong> ${args.location}</p><p>Our team will review availability and contact you shortly.</p>`,
      }),
      resend.emails.send({
        from,
        to: staffEmail,
        subject: `New quote request — ${args.publicReference}`,
        html: `<h1>New qualified quote request</h1><p><strong>${args.customerName}</strong><br/>${args.customerEmail}<br/>${args.customerPhone}</p><p><strong>Event date:</strong> ${eventDate}<br/><strong>Location:</strong> ${args.location}</p><p>Open the Bonram admin dashboard to review it.</p>`,
      }),
    ]);
    return { sent: true };
  },
});
