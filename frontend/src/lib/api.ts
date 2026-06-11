import type { Order, ProductReview, ServiceReview } from "@terrasound/shared";
import { resolveApiUrl } from "./apiUrl";

const API_URL = resolveApiUrl();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : "Ошибка запроса";
    throw new Error(detail);
  }

  return response.json();
}

export interface ProductList {
  items: ProductCard[];
  total: number;
}

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

export interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  specs: Record<string, string>;
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
  getCategories: () => request<Category[]>("/api/categories"),

  getProductBrands: () => request<string[]>("/api/products/brands"),

  getCategoryFilters: (categoryId: string) =>
    request<CategoryFilters>(`/api/categories/${encodeURIComponent(categoryId)}/filters`),

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
    return request<ProductList>(`/api/products${attr ? `?${attr}` : ""}`);
  },

  getProduct: (id: string) =>
    request<ProductDetail>(`/api/products/${encodeURIComponent(id)}`),

  getServiceReviews: () => request<ServiceReview[]>("/api/reviews/service"),

  createProductReview: (productId: string, data: ProductReviewInput) =>
    request<ProductReview>(`/api/products/${encodeURIComponent(productId)}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createOrder: (data: OrderCreatePayload) =>
    request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createInstallationRequest: (data: InstallationRequestInput) =>
    request("/api/installation-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getServices: () => request<InstallationService[]>("/api/services"),

  getBrands: () => request<Brand[]>("/api/brands"),

  getBlogPosts: () => request<BlogPostCard[]>("/api/blog"),

  getBlogPost: (id: string) => request<BlogPostDetail>(`/api/blog/${id}`),

  getPortfolio: () => request<PortfolioWork[]>("/api/portfolio"),

  getSiteStats: () => request<SiteStats>("/api/site-stats"),
};

export interface SiteStats {
  installationsCompleted: number;
  yearsExpertise: number;
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
