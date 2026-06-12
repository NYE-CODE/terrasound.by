/**
 * HTTP-клиент публичного API v1.
 * Списки: `{ data, meta }`. Ошибки: `ApiError` и `messageFromApiError`.
 */
import type { Order, ProductReview, ServiceReview } from "@terrasound/shared";
import { ApiError, parseApiErrorBody } from "./apiError";
import { resolveApiUrl } from "./apiUrl";

export { ApiError, messageFromApiError } from "./apiError";

const API_URL = resolveApiUrl();
const API_V1 = "/api/v1";

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

/** Стандартный ответ списка API v1. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw parseApiErrorBody(body, response.status);
  }

  return response.json();
}

export type ProductList = Paginated<ProductCard>;

export interface ProductCard {
  id: string;
  brand: string;
  name: string;
  specs: string;
  price: number;
  salePrice?: number | null;
  image: string;
  category: string;
  inStock?: boolean;
  ratingAvg?: number | null;
  reviewCount?: number;
  createdAt?: string | null;
}

export interface ProductAttributeSpec {
  label: string;
  value: string;
  sortOrder?: number;
}

export interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  specs: Record<string, string>;
  attributes?: Record<string, string | number | boolean | null>;
  attributeSpecs?: ProductAttributeSpec[];
  compatibility: string[];
  inStock: boolean;
  reviews: ProductReview[];
  ratingAvg?: number | null;
  reviewCount?: number;
}

export interface ProductReviewInput {
  author: string;
  email: string;
  text: string;
  rating: number;
}

export interface OrderCreatePayload {
  contact: {
    name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
  };
  car: {
    make: string;
    model: string;
    year: string;
    comment?: string;
  };
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: string;
}

export interface InstallationRequestInput {
  name: string;
  phone: string;
  carModel: string;
  service: string;
}

export const api = {
  /** Категории каталога (limit=500, только data). */
  getCategories: () =>
    request<Paginated<Category>>(`${API_V1}/categories?limit=500`).then((res) => res.data),

  getProductBrands: () => request<string[]>(`${API_V1}/catalog/brands`),

  getCatalogPriceBounds: () => request<PriceBounds>(`${API_V1}/catalog/price-bounds`),

  getCategoryFilters: (categoryId: string) =>
    request<CategoryFilters>(`${API_V1}/categories/${encodeURIComponent(categoryId)}/filters`),

  /** Фильтры категории; query attr.* формируется отдельно в attrQuery. */
  getProducts: (params?: {
    category?: string;
    brand?: string;
    brands?: string[];
    inStock?: boolean[];
    priceMin?: number;
    priceMax?: number;
    attrQuery?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) => {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.brands?.length) {
      params.brands.forEach((brand) => search.append("brands", brand));
    } else if (params?.brand) {
      search.set("brand", params.brand);
    }
    params?.inStock?.forEach((value) => search.append("inStock", String(value)));
    if (params?.priceMin != null) search.set("priceMin", String(params.priceMin));
    if (params?.priceMax != null) search.set("priceMax", String(params.priceMax));
    if (params?.sort) search.set("sort", params.sort);
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const base = search.toString();
    const attr = params?.attrQuery ? `${base ? `${base}&` : ""}${params.attrQuery}` : base;
    return request<ProductList>(`${API_V1}/products${attr ? `?${attr}` : ""}`);
  },

  getProduct: (id: string) =>
    request<ProductDetail>(`${API_V1}/products/${encodeURIComponent(id)}`),

  getServiceReviews: () =>
    request<Paginated<ServiceReview>>(`${API_V1}/service-reviews?limit=100`).then((res) => res.data),

  createProductReview: (productId: string, data: ProductReviewInput) =>
    request<ProductReview>(`${API_V1}/products/${encodeURIComponent(productId)}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createOrder: (data: OrderCreatePayload) =>
    request<Order>(`${API_V1}/orders`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createInstallationRequest: (data: InstallationRequestInput) =>
    request(`${API_V1}/installation/requests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getServices: () =>
    request<Paginated<InstallationService>>(`${API_V1}/installation/services?limit=500`).then(
      (res) => res.data,
    ),

  getBrands: () => request<Paginated<Brand>>(`${API_V1}/brands?limit=500`).then((res) => res.data),

  getBlogPosts: () =>
    request<Paginated<BlogPostCard>>(`${API_V1}/blog-posts?limit=500`).then((res) => res.data),

  getBlogPost: (id: string) => request<BlogPostDetail>(`${API_V1}/blog-posts/${id}`),

  getPortfolio: () =>
    request<Paginated<PortfolioWork>>(`${API_V1}/portfolio-works?limit=500`).then((res) => res.data),

  getSiteStats: () => request<SiteStats>(`${API_V1}/site-stats`),

  getSiteContact: () => request<SiteContact>(`${API_V1}/site-contact`),
};

export interface SiteStats {
  installationsCompleted: string;
  yearsExpertise: string;
}

export interface SiteContact {
  phone: string;
  email: string;
  instagramUrl: string;
  tiktokUrl: string;
  address: string;
  phoneTel: string;
  addressMapsUrl: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
  gridCols: number;
  gridTall: boolean;
}

export interface CategoryFilterOption {
  value: string;
  label: string;
  sortOrder: number;
}

export interface CategoryFilter {
  attributeId: string;
  label: string;
  valueType: string;
  filterType: string;
  unit?: string | null;
  options: CategoryFilterOption[];
  filterMin?: number | null;
  filterMax?: number | null;
  filterStep?: number | null;
  groupLabel?: string | null;
  sortOrder: number;
}

export interface PriceBounds {
  priceMin: number;
  priceMax: number;
}

export interface CategoryFilters {
  categoryId: string;
  priceMin: number;
  priceMax: number;
  filters: CategoryFilter[];
}

export interface InstallationService {
  id: string;
  title: string;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  country: string;
  since: string;
}

export interface BlogPostCard {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  createdAt: string;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface PortfolioWork {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
}
