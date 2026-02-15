// Bonram Rentals - Type Definitions

// ============================================
// Product Types
// ============================================

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: ProductCategory;
  dailyRate: number;
  totalStock: number;
  minGuests?: number;
  maxGuests?: number;
  imageStorageId?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ProductCategory = 
  | 'Sanitation'
  | 'Structures'
  | 'Power'
  | 'Audio'
  | 'Seating'
  | 'Lighting'
  | 'Transport'
  | 'Catering';

export interface ProductBadge {
  type: 'popular' | 'premium' | 'essential' | 'new';
  label: string;
}

// ============================================
// Quotation Types
// ============================================

export interface Quotation {
  _id: string;
  userId?: string;
  status: QuotationStatus;
  eventDetails: EventDetails;
  customerContact: CustomerContact;
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  adminNotes?: string;
  internalNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export type QuotationStatus = 
  | 'draft'
  | 'pending_review'
  | 'reviewing'
  | 'sent_to_client'
  | 'confirmed'
  | 'cancelled';

export interface EventDetails {
  location: string;
  locationLat?: number;
  locationLng?: number;
  guestCount: number;
  startDate: number;
  endDate: number;
  eventType?: EventType;
}

export type EventType = 
  | 'wedding'
  | 'corporate'
  | 'government'
  | 'funeral'
  | 'festival'
  | 'private'
  | 'other';

export interface CustomerContact {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

// ============================================
// Quotation Item Types
// ============================================

export interface QuotationItem {
  _id: string;
  quotationId: string;
  productId: string;
  product?: Product;
  quantity: number;
  priceAtTime: number;
  lineTotal: number;
}

// ============================================
// User Types
// ============================================

export interface User {
  _id: string;
  name: string;
  email: string;
  tokenIdentifier: string;
  role: UserRole;
  createdAt: number;
}

export type UserRole = 'admin' | 'staff' | 'customer';

// ============================================
// Invitation Types
// ============================================

export interface Invitation {
  _id: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'pending' | 'accepted';
  invitedBy: string;
  createdAt: number;
}

// ============================================
// Booking Types
// ============================================

export interface Booking {
  _id: string;
  quotationId: string;
  productId: string;
  quantity: number;
  startDate: number;
  endDate: number;
  status: BookingStatus;
}

export type BookingStatus = 
  | 'reserved'
  | 'confirmed'
  | 'returned'
  | 'cancelled';

// ============================================
// UI State Types
// ============================================

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface LocationData {
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface QuickStartFormData {
  dateRange: DateRange;
  location: LocationData;
  guestCount: number;
}

export interface QuoteCartState {
  items: QuoteCartItem[];
  eventDetails: Partial<EventDetails>;
  customerContact?: Partial<CustomerContact>;
}

export interface QuoteCartItem {
  productId: string;
  product: Product;
  quantity: number;
}

// ============================================
// Recommendation Types
// ============================================

export interface Recommendation {
  product: Product;
  reason: string;
  priority: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// Kanban Types
// ============================================

export interface KanbanColumn {
  id: QuotationStatus;
  title: string;
  items: Quotation[];
}

export const KANBAN_COLUMNS: { id: QuotationStatus; title: string }[] = [
  { id: 'pending_review', title: 'New Request' },
  { id: 'reviewing', title: 'Reviewing' },
  { id: 'sent_to_client', title: 'Sent to Client' },
  { id: 'confirmed', title: 'Approved' },
  { id: 'cancelled', title: 'Cancelled' },
];
