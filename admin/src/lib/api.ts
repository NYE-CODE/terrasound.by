import { resolveApiUrl } from "./apiUrl";

const API_URL = resolveApiUrl();

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : "Ошибка запроса";
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ accessToken: string }>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  changePassword: (token: string, data: ChangePasswordInput) =>
    request<{ message: string }>("/api/admin/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  dashboard: (token: string) => request<DashboardStats>("/api/admin/dashboard", {}, token),

  siteStats: (token: string) => request<SiteStats>("/api/admin/site-stats", {}, token),

  updateSiteStats: (token: string, data: SiteStatsInput) =>
    request<SiteStats>("/api/admin/site-stats", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  orders: (token: string) => request<Order[]>("/api/admin/orders", {}, token),

  updateOrderStatus: (token: string, orderId: string, status: OrderStatus) =>
    request<Order>(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),

  productReviews: (token: string) =>
    request<ProductReview[]>("/api/admin/reviews/product", {}, token),

  updateProductReview: (token: string, reviewId: string, published: boolean) =>
    request<ProductReview>(`/api/admin/reviews/product/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }, token),

  serviceReviews: (token: string) =>
    request<ServiceReview[]>("/api/admin/reviews/service", {}, token),

  createServiceReview: (token: string, data: ServiceReviewInput) =>
    request<ServiceReview>("/api/admin/reviews/service", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  updateServiceReview: (token: string, reviewId: string, data: Partial<ServiceReviewInput>) =>
    request<ServiceReview>(`/api/admin/reviews/service/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteServiceReview: (token: string, reviewId: string) =>
    request<void>(`/api/admin/reviews/service/${reviewId}`, { method: "DELETE" }, token),

  installationRequests: (token: string) =>
    request<InstallationRequest[]>("/api/admin/installation-requests", {}, token),

  products: (token: string) => request<AdminProduct[]>("/api/admin/products", {}, token),

  product: (token: string, productId: string) =>
    request<AdminProduct>(`/api/admin/products/${productId}`, {}, token),

  createProduct: (token: string, data: ProductInput) =>
    request<AdminProduct>("/api/admin/products", { method: "POST", body: JSON.stringify(data) }, token),

  updateProduct: (token: string, productId: string, data: Partial<ProductInput>) =>
    request<AdminProduct>(`/api/admin/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteProduct: (token: string, productId: string) =>
    request<void>(`/api/admin/products/${productId}`, { method: "DELETE" }, token),

  services: (token: string) => request<InstallationService[]>("/api/admin/services", {}, token),

  createService: (token: string, data: InstallationServiceInput) =>
    request<InstallationService>("/api/admin/services", { method: "POST", body: JSON.stringify(data) }, token),

  updateService: (token: string, id: string, data: Partial<InstallationServiceInput>) =>
    request<InstallationService>(`/api/admin/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteService: (token: string, id: string) =>
    request<void>(`/api/admin/services/${id}`, { method: "DELETE" }, token),

  brands: (token: string) => request<Brand[]>("/api/admin/brands", {}, token),

  createBrand: (token: string, data: BrandInput) =>
    request<Brand>("/api/admin/brands", { method: "POST", body: JSON.stringify(data) }, token),

  updateBrand: (token: string, id: string, data: Partial<BrandInput>) =>
    request<Brand>(`/api/admin/brands/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteBrand: (token: string, id: string) =>
    request<void>(`/api/admin/brands/${id}`, { method: "DELETE" }, token),

  blogPosts: (token: string) => request<BlogPost[]>("/api/admin/blog", {}, token),

  createBlogPost: (token: string, data: BlogPostInput) =>
    request<BlogPost>("/api/admin/blog", { method: "POST", body: JSON.stringify(data) }, token),

  updateBlogPost: (token: string, id: string, data: Partial<BlogPostInput>) =>
    request<BlogPost>(`/api/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteBlogPost: (token: string, id: string) =>
    request<void>(`/api/admin/blog/${id}`, { method: "DELETE" }, token),

  portfolioWorks: (token: string) => request<PortfolioWork[]>("/api/admin/portfolio", {}, token),

  createPortfolioWork: (token: string, data: PortfolioWorkInput) =>
    request<PortfolioWork>("/api/admin/portfolio", { method: "POST", body: JSON.stringify(data) }, token),

  updatePortfolioWork: (token: string, id: string, data: Partial<PortfolioWorkInput>) =>
    request<PortfolioWork>(`/api/admin/portfolio/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deletePortfolioWork: (token: string, id: string) =>
    request<void>(`/api/admin/portfolio/${id}`, { method: "DELETE" }, token),

  categories: (token: string) => request<CategoryAdmin[]>("/api/admin/categories", {}, token),

  category: (token: string, id: string) =>
    request<CategoryAdmin>(`/api/admin/categories/${id}`, {}, token),

  createCategory: (token: string, data: CategoryInput) =>
    request<CategoryAdmin>("/api/admin/categories", { method: "POST", body: JSON.stringify(data) }, token),

  updateCategory: (token: string, id: string, data: Partial<CategoryUpdateInput>) =>
    request<CategoryAdmin>(`/api/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteCategory: (token: string, id: string) =>
    request<void>(`/api/admin/categories/${id}`, { method: "DELETE" }, token),

  attributes: (token: string) => request<AttributeDef[]>("/api/admin/attributes", {}, token),

  attribute: (token: string, id: string) =>
    request<AttributeDef>(`/api/admin/attributes/${id}`, {}, token),

  createAttribute: (token: string, data: AttributeInput) =>
    request<AttributeDef>("/api/admin/attributes", { method: "POST", body: JSON.stringify(data) }, token),

  updateAttribute: (token: string, id: string, data: Partial<AttributeInput>) =>
    request<AttributeDef>(`/api/admin/attributes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteAttribute: (token: string, id: string) =>
    request<void>(`/api/admin/attributes/${id}`, { method: "DELETE" }, token),

  categoryAttributes: (token: string, categoryId: string) =>
    request<CategoryAttributeLink[]>(`/api/admin/categories/${categoryId}/attributes`, {}, token),

  categoryAttributeSchema: (token: string, categoryId: string) =>
    request<CategoryAttributeSchema[]>(`/api/admin/categories/${categoryId}/attribute-schema`, {}, token),

  createCategoryAttribute: (token: string, categoryId: string, data: CategoryAttributeInput) =>
    request<CategoryAttributeLink>(`/api/admin/categories/${categoryId}/attributes`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  updateCategoryAttribute: (token: string, categoryId: string, linkId: number, data: Partial<CategoryAttributeInput>) =>
    request<CategoryAttributeLink>(`/api/admin/categories/${categoryId}/attributes/${linkId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteCategoryAttribute: (token: string, categoryId: string, linkId: number) =>
    request<void>(`/api/admin/categories/${categoryId}/attributes/${linkId}`, { method: "DELETE" }, token),
};

export type OrderStatus = "new" | "confirmed" | "completed" | "cancelled";

export interface DashboardStats {
  ordersNew: number;
  ordersTotal: number;
  reviewsPending: number;
  installationRequests: number;
}

export interface SiteStats {
  installationsCompleted: number;
  yearsExpertise: number;
}

export interface SiteStatsInput {
  installationsCompleted: number;
  yearsExpertise: number;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface OrderItem {
  productId: string;
  productBrand: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  carMake: string;
  carModel: string;
  carYear: string;
  carComment?: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  email?: string;
  text: string;
  rating: number;
  createdAt: string;
  published: boolean;
}

export interface ServiceReview {
  id: string;
  author: string;
  car?: string;
  rating: number;
  text: string;
  createdAt: string;
  published: boolean;
}

export interface ServiceReviewInput {
  author: string;
  car?: string;
  rating: number;
  text: string;
  published?: boolean;
}

export interface InstallationRequest {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  service: string;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  brand: string;
  name: string;
  price: number;
  salePrice?: number | null;
  category: string;
  imageUrl: string;
  specsShort: string;
  inStock: boolean;
  images: string[];
  specs: Record<string, string>;
  attributes: Record<string, string | number | boolean | null>;
  compatibility: string[];
}

export interface ProductInput {
  brand: string;
  name: string;
  price: number;
  salePrice?: number | null;
  category: string;
  imageUrl: string;
  specsShort?: string;
  inStock?: boolean;
  images?: string[];
  specs?: Record<string, string>;
  attributes?: Record<string, string | number | boolean | null>;
  compatibility?: string[];
}

export interface AttributeOption {
  value: string;
  label: string;
  sortOrder: number;
}

export interface AttributeDef {
  id: string;
  label: string;
  valueType: string;
  unit?: string | null;
  options: AttributeOption[];
}

export interface AttributeInput {
  id: string;
  label: string;
  valueType: string;
  unit?: string | null;
  options?: AttributeOption[];
}

export interface CategoryAttributeLink {
  id: number;
  categoryId: string;
  attributeId: string;
  attributeLabel: string;
  valueType: string;
  unit?: string | null;
  options: AttributeOption[];
  showInForm: boolean;
  showInFilters: boolean;
  showOnCard: boolean;
  filterType?: string | null;
  filterMin?: number | null;
  filterMax?: number | null;
  filterStep?: number | null;
  required: boolean;
  sortOrder: number;
  groupLabel?: string | null;
}

export interface CategoryAttributeSchema {
  attributeId: string;
  label: string;
  valueType: string;
  unit?: string | null;
  options: AttributeOption[];
  required: boolean;
  sortOrder: number;
  groupLabel?: string | null;
}

export interface CategoryAttributeInput {
  attributeId: string;
  showInForm?: boolean;
  showInFilters?: boolean;
  showOnCard?: boolean;
  filterType?: string | null;
  filterMin?: number | null;
  filterMax?: number | null;
  filterStep?: number | null;
  required?: boolean;
  sortOrder?: number;
  groupLabel?: string | null;
}

export interface InstallationService {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  published: boolean;
}

export interface InstallationServiceInput {
  title: string;
  description: string;
  sortOrder?: number;
  published?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  country: string;
  since: string;
  sortOrder: number;
  published: boolean;
}

export interface BrandInput {
  name: string;
  description: string;
  country: string;
  since: string;
  sortOrder?: number;
  published?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
}

export interface BlogPostInput {
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  published?: boolean;
}

export interface PortfolioWork {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
}

export interface PortfolioWorkInput {
  title: string;
  imageUrl: string;
  sortOrder?: number;
  published?: boolean;
}

export interface CategoryAdmin {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
  gridCols: number;
  gridTall: boolean;
  published: boolean;
  productCount: number;
}

export interface CategoryInput {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder?: number;
  gridCols?: number;
  gridTall?: boolean;
  published?: boolean;
}

export interface CategoryUpdateInput {
  name: string;
  imageUrl: string;
  sortOrder?: number;
  gridCols?: number;
  gridTall?: boolean;
  published?: boolean;
}
