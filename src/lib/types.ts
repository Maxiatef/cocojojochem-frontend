export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount?: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  label: string;
  price: string;
  salePrice: string | null;
  stockQuantity: number | null;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  imageUrl: string | null;
  isOnSale?: boolean;
  effectivePrice?: string;
  lowStockThreshold: number | null;
  limitPerOrder: boolean;
  maxOrderQuantity: number | null;
  availableFrom: string | null;
  weightLb: string | null;
  isSoldByDrum?: boolean;
}

export interface ProductFunction {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
}

export interface Certification {
  id: number;
  name: string;
  iconUrl: string | null;
}

export type ProductVisibility = 'PUBLIC' | 'PRIVATE' | 'PASSWORD_PROTECTED';

export interface ProductSpecRow {
  id: number;
  key: string;
  value: string;
}

export interface ProductSeoData {
  focusKeyphrase: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  socialTitle: string | null;
  socialDescription: string | null;
  socialImageUrl: string | null;
  tags: string[] | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  inciName: string | null;
  botanicalName?: string | null;
  casNumber?: string | null;
  shortDescription: string | null;
  chemicalDescriptions?: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  visibility: ProductVisibility;
  visibilityPassword: string | null;
  scheduledPublishAt: string | null;
  brand: string | null;
  description: string | null;
  specs: ProductSpecRow[];
  seo: ProductSeoData | null;
  category?: Category;
  functions?: ProductFunction[];
  certifications?: Certification[];
  variants: ProductVariant[];
  gallery?: ProductGalleryImage[];
  createdAt: string;
}

export interface ProductGalleryImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ServerCartItem {
  id: number;
  productVariantId: number;
  quantity: number;
  price: string;
  variant: ProductVariant & { product?: Product };
}

export interface ServerCart {
  id: number;
  items: ServerCartItem[];
}

export interface ServerQuoteListItem {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
}

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Company {
  id: number;
  name: string;
  taxId: string | null;
  website: string | null;
  industry: string | null;
  status: AccountStatus;
  createdAt: string;
  userCount?: number;
  quoteRequestCount?: number;
}

export interface CompanyUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
}

export interface CompanyDetail extends Company {
  users: CompanyUser[];
}

export type RequestType = 'QUOTE' | 'SAMPLE' | 'WHITE_LABEL' | 'CONTACT';
export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'QUOTED' | 'WON' | 'LOST';

export type ContactMessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  authorName: string;
  company: string | null;
  quote: string;
  result: string | null;
  imageUrl: string | null;
}

export interface CustomerProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  companyId: number | null;
  company: Company | null;
  createdAt: string;
}

export interface QuoteRequestItem {
  id: number;
  productName: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
}

export interface QuoteRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  message: string | null;
  type: RequestType;
  status: RequestStatus;
  items: QuoteRequestItem[];
  createdAt: string;
  user?: { id: number; fullName: string; email: string } | null;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productVariantId: number | null;
  productName: string;
  variantLabel: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  price: string;
}

// No `order` here — the order isn't created until Stripe confirms payment
// via webhook, so at checkout-response time there's nothing to return but
// the Stripe redirect (and, for a new-account guest checkout, the token).
export interface CheckoutResponse {
  checkoutUrl: string | null;
  accessToken?: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  subtotal: string;
  total: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  user?: { id: number; fullName: string; email: string; phone?: string | null; company?: Company | null };
  guestEmail?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  shippingAddress?: string | null;
  notes?: string | null;
  couponAmount?: string;
  shippingCost?: string;
  taxAmount?: string;
  // Present only when a guest checkout created a new account — lets the frontend auto-log-in.
  accessToken?: string;
  trackingNumber: string | null;
  carrierCode: string | null;
}

// Response shape from POST /orders/shipping-estimate. Deterministic
// rate-table logic (ported from the real cocojojo.com site) — `available` is
// always true once the request succeeds; `canShip` is false for a
// non-shippable destination (unmapped US territory or a country outside the
// supported international rate groups), which never fabricates a cost.
export type ShippingEstimate = {
  available: boolean;
  canShip: boolean;
  isDomestic: boolean;
  shippingCost?: number;
  zone?: number;
  zoneName?: string;
  regionLabel?: string;
  shippingMethod?: string;
  weightLb?: number;
  subtotal: number;
  wholesaleMinimum: number;
  meetsMinimum: boolean;
  minimumRemaining: number;
  isFreeShipping?: boolean;
  freeShippingThreshold?: number;
  amountAwayFromFreeShipping?: number;
  errorMessage?: string;
  carrierNotice?: string;
  taxAmount?: number;
  taxName?: string;
};

// Shape returned by GET /orders/:id/tracking (and /orders/:id/tracking/admin).
export interface TrackingCheckpoint {
  status: string;
  description: string;
  location: string | null;
  timestamp: string;
}

export type TrackingInfo =
  | { available: false; reason: 'not_shipped_yet' | 'tracking_not_configured' | 'lookup_failed' }
  | {
      available: true;
      carrier: string;
      trackingNumber: string;
      currentStatus:
        | 'PRE_TRANSIT'
        | 'TRANSIT'
        | 'OUT_FOR_DELIVERY'
        | 'PICKUP'
        | 'DELIVERED'
        | 'RETURNED'
        | 'FAILURE'
        | 'UNKNOWN';
      eta: string | null;
      checkpoints: TrackingCheckpoint[];
    };

export interface DashboardRecentOrder {
  id: number;
  status: OrderStatus;
  total: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
}

export interface DashboardOverview {
  catalog: { productCount: number; categoryCount: number };
  accounts: { companyCount: number };
  leads: { newQuoteRequestCount: number; totalQuoteRequestCount: number };
  orders: {
    pendingOrderCount: number;
    totalRevenue: number;
    statusBreakdown: { status: OrderStatus; count: number }[];
    recent: DashboardRecentOrder[];
  };
  revenue: {
    last30Days: { day: string; revenue: number; orderCount: number }[];
  };
  inventory: {
    outOfStockCount: number;
    onBackorderCount: number;
    lowStockCount: number;
    lowStockProducts: {
      variantId: number;
      variantLabel: string;
      sku: string;
      stockQuantity: number;
      productId: number;
      productName: string;
      productSlug: string;
    }[];
  };
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  marketing: { subscriberCount: number };
}

export interface QuoteRequestStats {
  total: number;
  byStatus: { status: RequestStatus; count: string }[];
  byType: { type: RequestType; count: string }[];
  last30Days: { day: string; count: string }[];
}

// --- Coupons ----------------------------------------------------------------

export type CouponType = 'PERCENTAGE_CART' | 'PERCENTAGE_PRODUCT' | 'FIXED_CART' | 'FIXED_PRODUCT';

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  type: CouponType;
  value: string;
  minOrderAmount: string | null;
  maxOrderAmount: string | null;
  maxDiscount: string | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  applicableToAllCategories: boolean;
  applicableToAllProducts: boolean;
  excludedCategoryIds: string | null;
  excludedProductIds: string | null;
  excludedVariantIds: string | null;
  includedCategoryIds: string | null;
  includedProductIds: string | null;
  includedVariantIds: string | null;
  maxUsagePerUser: number | null;
  allowFreeShipping: boolean;
  individualUseOnly: boolean;
  excludeSaleItems: boolean;
  allowedEmails: string[] | null;
  limitUsageToXItems: number | null;
  includedBrands: string[] | null;
  excludedBrands: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponAnalyticsAll {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  expiredCoupons: number;
  totalDiscountGiven: number;
  totalUsages: number;
  topUsers: { email: string; usageCount: number }[];
  topProducts: { productName: string; quantitySold: number }[];
  topCoupons: { couponId: number; code: string; usageCount: number }[];
}

export interface CouponAnalyticsOne {
  coupon: Coupon;
  usageCount: number;
  totalDiscountGiven: number;
  recentUsages: { id: number; couponId: number; orderId: number | null; email: string; usedAt: string }[];
  topUsers: { email: string; usageCount: number }[];
}

export interface CouponValidateResult {
  isValid: boolean;
  coupon?: Coupon;
  message?: string;
  discountAmount?: number;
  finalAmount?: number;
  eligibleItemsCount?: number;
  totalItemsCount?: number;
}

// --- Bulk sale discounts ------------------------------------------------------

export interface BulkSaleDiscount {
  id: number;
  name: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categoryIds: string | null;
  productIds: string | null;
  variantIds: string | null;
  applyToAllVariants: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- SEO pages ----------------------------------------------------------------

export interface SeoPage {
  id: number;
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
}

// --- SEO analyzer ---------------------------------------------------------------

export type SeoIssueType =
  | 'MISSING_TITLE'
  | 'MISSING_META_DESCRIPTION'
  | 'MISSING_H1'
  | 'MULTIPLE_H1'
  | 'THIN_CONTENT'
  | 'MISSING_ALT_TEXT';

export type SeoIssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SeoMetric {
  id: number;
  path: string;
  title: string | null;
  metaDescription: string | null;
  h1Tag: string | null;
  wordCount: number | null;
  internalLinks: number;
  externalLinks: number;
  imageCount: number;
  imagesWithAltText: number;
  pageLoadTimeMs: number | null;
  seoScore: number | null;
  lastAnalyzed: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeoIssue {
  id: number;
  path: string;
  issueType: SeoIssueType;
  severity: SeoIssueSeverity;
  description: string;
  isFixed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeoOverview {
  totalPagesAnalyzed: number;
  averageScore: number;
  totalIssues: number;
  issuesBySeverity: Record<SeoIssueSeverity, number>;
  lastAnalyzed: string | null;
}

export interface SeoAnalyzeResult {
  analyzed: number;
  total: number;
  metrics: SeoMetric[];
  issues: SeoIssue[];
}

// --- Site settings --------------------------------------------------------------

export interface SiteSettingsResponse {
  settings: Record<string, string | null>;
  rows: { id: number; key: string; value: string | null; updatedAt: string }[];
}

// --- Users ----------------------------------------------------------------------

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SALES';

export interface UserListItem {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  companyId: number | null;
  company: Company | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface UserDetail extends UserListItem {
  orders: Order[];
  quoteRequests: QuoteRequest[];
  lastOrderDate?: string | null;
}

// --- Analytics --------------------------------------------------------------

export interface SalesProductsAnalytics {
  range: { days: number; from: string; to: string };
  revenue: {
    series: { day: string; revenue: number; orderCount: number }[];
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  products: {
    productId: number;
    name: string;
    categoryName: string | null;
    unitsSold: number;
    revenue: number;
    orderCount: number;
    stockStatus: string;
  }[];
  categories: {
    categoryId: number;
    name: string;
    revenue: number;
    unitsSold: number;
  }[];
  topCompanies: {
    companyId: number;
    name: string;
    revenue: number;
    orderCount: number;
  }[];
  slowMovers: {
    productId: number;
    name: string;
    categoryName: string | null;
    createdAt: string;
  }[];
}

export interface VisitorsAnalytics {
  range: { days: number; from: string; to: string };
  totalViews: number;
  totalUniqueVisitors: number;
  series: { day: string; views: number; uniqueVisitors: number }[];
  topPages: { path: string; views: number; uniqueVisitors: number }[];
}

// --- Shipping zones & rate tiers -----------------------------------------------

// Zone assignments (read-only, GET /orders/admin/shipping-reference)
export interface ShippingZoneGroup {
  zone: number;
  states: { code: string; name: string }[];
}

// Editable Zone 1-7 rate table row (GET/PUT /admin/shipping-rate-tiers)
export interface ShippingRateTierRow {
  breakpoint: number; // weight in lb, or drum count, depending on `kind`
  rates: (number | null)[]; // index 0 = Zone 1 ... index 6 = Zone 7
}
