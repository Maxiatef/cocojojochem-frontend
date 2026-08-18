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
  isActive: boolean;
  isFeatured: boolean;
  category?: Category;
  functions?: ProductFunction[];
  certifications?: Certification[];
  variants: ProductVariant[];
  createdAt: string;
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
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  subtotal: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
  user?: { id: number; fullName: string; email: string; company?: Company | null };
  // Present only when a guest checkout created a new account — lets the frontend auto-log-in.
  accessToken?: string;
}

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
  accounts: { companyCount: number; pendingCompanyCount: number };
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
  inventory: { outOfStockCount: number; onBackorderCount: number };
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

export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  type: CouponType;
  value: string;
  minOrderAmount: string | null;
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
  recentOrders: Order[];
}
