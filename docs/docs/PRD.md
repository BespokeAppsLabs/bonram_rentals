# Product Requirements Document (PRD): Bonram Rentals Portal

**Version:** 1.0
**Status:** Draft
**Date:** February 2026

---

## 1. Executive Summary

**Project Name:** Bonram Rentals Digital Portal
**Vision:** To transition Bonram Rentals from a standard hire company to a digital-first "Institutional Luxury" service provider. The platform will bridge the gap between "browsing" and "finalizing a contract," streamlining operations while maintaining a high-touch, consultative client experience.
**Core Value Proposition:** A "Quote-First" workflow that minimizes operational friction (double-bookings, pricing errors) while maximizing user conversion through a premium, guided digital experience.

---

## 2. Product Objectives

1.  **Digitize the "Consultation":** Move the initial inquiry phase online without losing the personal, high-end feel.
2.  **Eliminate Double-Booking:** Real-time inventory tracking to prevent commitment to unavailable stock.
3.  **Streamline Operations:** Centralize quotes, inventory, and client history in a single "Brain" (Admin Portal).
4.  **Brand Elevation:** Reflect the "Institutional Luxury" identity through a polished, high-performance web interface.

---

## 3. Target Audience & Personas

### 3.1 Primary Personas
*   **The "Presidential" Planner (B2B/Gov):**
    *   **Needs:** Reliability, scale, compliance documents, bulk orders (e.g., 500 chairs, 20 VIP toilets).
    *   **Behavior:** Values efficiency and "official" paperwork. Needs precise quotes for PO approvals.
*   **The Event Host (B2C/Weddings):**
    *   **Needs:** Aesthetics, guidance, "wow" factor (e.g., White Tent, Tiffany chairs).
    *   **Behavior:** Browses visually. Needs reassurance on quality and "look and feel."

### 3.2 Secondary Personas (Internal)
*   **The Administrator/Owner:**
    *   Needs a bird's-eye view of stock, upcoming deliveries, and pending quotes.
    *   Requires ability to override prices/availability for special clients.

---

## 4. User Journeys & Functional Requirements

### 4.1 The Public Portal (Client Facing)

**Philosophy:** High-friction for mistakes (prevent invalid dates/locations), low-friction for users (easy to browse/add).

#### **Feature 1: Interactive Lead Header (Home)**
*   **Requirement:** "Quick-Start Bar" replacing standard static hero.
*   **Inputs:** Date Range, Location (Google Maps Autocomplete), Guest Count.
*   **Outcome:** Users are immediately funneled into a filtered view relevant to their event size.

#### **Feature 2: Equipment Catalog ("The Gallery")**
*   **Layout:** Masonry/Spacious grid. No tight rows.
*   **Interactions:** 
    *   Quick-Add (+/-) directly on cards.
    *   Live "Availability Check" based on selected dates.
*   **Smart Search:** Filter by Category (Sanitation, Structures, Power) and Event Scale (e.g., "Suitable for <50 guests").

#### **Feature 3: The "Quote Cart" & Smart Checkout**
*   **Concept:** Instead of "Buy Now," it is "Add to Quote."
*   **Smart Logic:** 
    *   *Upsell:* If Guest Count > 100 AND no Generator in cart -> Suggest "MW8000D Generator".
    *   *Safety:* If Location = "Remote" -> Suggest "Portable Toilets".
*   **Submission:** Captures Contact Details, Project Type (Corporate/Private), and Special Requests.
*   **Output:** Generates a "Draft Quote" in the system and emails a summary to the user.

### 4.2 The Admin Portal (Internal "Brain")

**Access:** Auth-protected (likely Clerk/NextAuth). Role-based (Admin, Staff).

#### **Feature 4: Inventory Management**
*   **CRUD:** Add/Edit/Retire equipment.
*   **Status Tracking:** "Available", "Out on Rent", "Maintenance", "Retired".
*   **Real-Time Logic:** Defining "Effective Availability" = Total Stock - (Confirmed Bookings + Maintenance).

#### **Feature 5: Quote Desk (CRM)**
*   **Kanban View:** New Request -> Reviewing -> Quote Sent -> Approved -> Paid -> Completed.
*   **Pricing Engine:** Ability to apply discretionary discounts or delivery fees before finalizing.
*   **Action:** "Convert to Invoice/Contract" button (generates PDF).

#### **Feature 6: Calendar & Logistics**
*   **View:** Monthly/Weekly view of what goes out when.
*   **Conflict Alert:** Visual warning if a quote overlaps with low stock.

---

## 5. Technical Architecture

**Stack:**
*   **Frontend:** **Next.js** (React) - For SEO, performance, and server-side rendering.
*   **Backend/Database:** **Convex** - For real-time data syncing, reactive UI (inventory updates), and integrated file storage.
*   **Authentication:** **Clerk** (or NextAuth) - For secure, role-based access control.
*   **Styling:** **Tailwind CSS** (presumed) or Custom CSS variables matching Brand Guide.

**Data Model (High-Level Schema):**
*   `users`: ID, Role (Admin/Customer), AuthToken.
*   `equipment`: ID, Name, Category, DayRate, TotalStock, ImageID, Status.
*   `quotes`: ID, UserID, DateRange, Status, TotalEstimate.
*   `quote_items`: QuoteID, EquipmentID, Quantity, SnapshotRate.

---

## 6. Design System Guidelines

**Aesthetic:** "Institutional Luxury" vs "Modern Industrial".

*   **Palette:**
    *   Primary: **Navy Blue** (`#1e3a5f`) - Trust, Authority.
    *   Accent: **Gold** (`#d4af37`) - Premium, Highlights.
    *   Base: **White** & **Mist** (`#f5f5f5`) - Cleanliness, Space.
*   **Typography:**
    *   Headings: **Montserrat** (Bold) - "Presidential".
    *   Body: **Open Sans** (Regular) - Readable.
*   **UI Elements:**
    *   **Cards:** Clean white, subtle drop-shadows, rounded corners.
    *   **Buttons:** High-contrast, "Pill" or slightly rounded. 
    *   **Navigation:** Sticky "Authority" header with Gold CTA.

---

## 7. Roadmap & Phasing

### Phase 1: MVP (The "Brochure Plus")
*   Public Catalog (Read-only inventory).
*   "Add to Quote" functionality.
*   Basic Email submission (Customer -> Admin).
*   Admin Dashboard: View Inquiry List (Read-only).

### Phase 2: The "Operational Brain" (Current Goal)
*   **Convex Integration:** Real-time database.
*   **Inventory Tracking:** Admin can update stock/status.
*   **Quote Management:** Admin can pricing/convert to PDF.
*   **Auth:** Admin login.

### Phase 3: "Closing the Loop" (Future)
*   **Digital Signatures:** DocuSign integration.
*   **Payments:** Online deposit payment link (PayFast/Yoco).
*   **Customer Portal:** "My Rentals" history view.

---

*This document serves as the single source of truth for the Bonram Rentals portal development.*
