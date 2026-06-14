/**
 * HTTP-клиент админского API v2.
 * При 401 с токеном вызывается обработчик из setUnauthorizedHandler (logout).
 */
import { resolveApiUrl } from "./apiUrl";
import { downloadBlob, filenameFromContentDisposition } from "./downloadBlob";
import { appendListQueryParams } from "./listQuery";
import { parseUploadError } from "./uploadHelpers";

const API_URL = resolveApiUrl();
const API_V2_ADMIN = "/api/v2/admin";

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

/** Стандартный ответ списка API. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

let unauthorizedHandler: (() => void) | null = null;

/** Глобальный callback на 401 — сброс сессии при протухшем JWT. */
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

function parseApiDetail(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first) {
      const msg = (first as { msg?: unknown }).msg;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
  }
  return null;
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
    const detail = parseApiDetail(body) ?? "Ошибка запроса";
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

interface UploadUrlPayload {
  data: { url: string };
}

async function uploadRequest(
  path: string,
  file: File,
  token: string,
): Promise<string> {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(parseUploadError(response, payload), response.status);
  }

  const payload = (await response.json()) as UploadUrlPayload;
  return payload.data.url;
}

async function downloadRequest(path: string, token: string, fallbackFilename: string) {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { headers });

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    const body = await response.json().catch(() => ({}));
    const detail = parseApiDetail(body) ?? "Ошибка запроса";
    throw new ApiError(detail, response.status);
  }

  const blob = await response.blob();
  const filename = filenameFromContentDisposition(
    response.headers.get("Content-Disposition"),
    fallbackFilename,
  );
  downloadBlob(blob, filename);
}

function buildListQuery(params?: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  appendListQueryParams(search, params ?? {});
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  login: (username: string, password: string) =>
    request<{ accessToken: string }>(`${API_V2_ADMIN}/sessions`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  changePassword: (token: string, data: ChangePasswordInput) =>
    request<void>(`${API_V2_ADMIN}/me/password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  dashboard: (token: string) => request<DashboardStats>(`${API_V2_ADMIN}/dashboard`, {}, token),

  siteStats: (token: string) => request<SiteStats>(`${API_V2_ADMIN}/site/settings/stats`, {}, token),

  updateSiteStats: (token: string, data: SiteStatsInput) =>
    request<SiteStats>(`${API_V2_ADMIN}/site/settings/stats`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  siteContact: (token: string) => request<SiteContact>(`${API_V2_ADMIN}/site/settings/contact`, {}, token),

  updateSiteContact: (token: string, data: SiteContactInput) =>
    request<SiteContact>(`${API_V2_ADMIN}/site/settings/contact`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  siteAnnouncement: (token: string) =>
    request<SiteAnnouncement>(`${API_V2_ADMIN}/site/settings/announcement`, {}, token),

  updateSiteAnnouncement: (token: string, data: SiteAnnouncementInput) =>
    request<SiteAnnouncement>(`${API_V2_ADMIN}/site/settings/announcement`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  productHighlights: (token: string) =>
    request<ProductHighlights>(`${API_V2_ADMIN}/site/settings/product-highlights`, {}, token),

  updateProductHighlights: (token: string, data: ProductHighlightsInput) =>
    request<ProductHighlights>(`${API_V2_ADMIN}/site/settings/product-highlights`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  orders: (token: string, params?: OrderListParams) =>
    request<Paginated<Order>>(
      `${API_V2_ADMIN}/orders${buildListQuery({
        limit: params?.limit,
        offset: params?.offset,
        q: params?.q,
        status: params?.status,
        paymentMethod: params?.paymentMethod,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      })}`,
      {},
      token,
    ),

  exportOrders: (token: string, params?: OrderExportParams) =>
    downloadRequest(
      `${API_V2_ADMIN}/orders/export${buildListQuery({
        q: params?.q,
        status: params?.status,
        paymentMethod: params?.paymentMethod,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      })}`,
      token,
      "orders.csv",
    ),

  getOrder: (token: string, orderId: string) =>
    request<Order>(`${API_V2_ADMIN}/orders/${orderId}`, {}, token),

  updateOrderStatus: (token: string, orderId: string, status: OrderStatus) =>
    request<Order>(`${API_V2_ADMIN}/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),

  deleteOrder: (token: string, orderId: string) =>
    request<void>(`${API_V2_ADMIN}/orders/${orderId}`, { method: "DELETE" }, token),

  productReviews: (token: string, params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const query = search.toString();
    return request<Paginated<ProductReview>>(
      `${API_V2_ADMIN}/product-reviews${query ? `?${query}` : ""}`,
      {},
      token,
    );
  },

  updateProductReview: (token: string, reviewId: string, published: boolean) =>
    request<ProductReview>(`${API_V2_ADMIN}/product-reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }, token),

  serviceReviews: (token: string, params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const query = search.toString();
    return request<Paginated<ServiceReview>>(
      `${API_V2_ADMIN}/service-reviews${query ? `?${query}` : ""}`,
      {},
      token,
    );
  },

  createServiceReview: (token: string, data: ServiceReviewInput) =>
    request<ServiceReview>(`${API_V2_ADMIN}/service-reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  updateServiceReview: (token: string, reviewId: string, data: Partial<ServiceReviewInput>) =>
    request<ServiceReview>(`${API_V2_ADMIN}/service-reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteServiceReview: (token: string, reviewId: string) =>
    request<void>(`${API_V2_ADMIN}/service-reviews/${reviewId}`, { method: "DELETE" }, token),

  installationRequests: (token: string, params?: InstallationRequestListParams) =>
    request<Paginated<InstallationRequest>>(
      `${API_V2_ADMIN}/installation-requests${buildListQuery({
        limit: params?.limit,
        offset: params?.offset,
        q: params?.q,
        service: params?.service,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      })}`,
      {},
      token,
    ),

  installationRequestServices: (token: string) =>
    request<string[]>(`${API_V2_ADMIN}/installation-requests/services`, {}, token),

  exportInstallationRequests: (token: string, params?: InstallationRequestExportParams) =>
    downloadRequest(
      `${API_V2_ADMIN}/installation-requests/export${buildListQuery({
        q: params?.q,
        service: params?.service,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      })}`,
      token,
      "installation-requests.csv",
    ),

  deleteInstallationRequest: (token: string, requestId: string) =>
    request<void>(`${API_V2_ADMIN}/installation-requests/${requestId}`, { method: "DELETE" }, token),

  products: (token: string, params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const query = search.toString();
    return request<Paginated<AdminProduct>>(`${API_V2_ADMIN}/products${query ? `?${query}` : ""}`, {}, token);
  },

  product: (token: string, productId: string) =>
    request<AdminProduct>(`${API_V2_ADMIN}/products/${productId}`, {}, token),

  createProduct: (token: string, data: ProductInput) =>
    request<AdminProduct>(`${API_V2_ADMIN}/products`, { method: "POST", body: JSON.stringify(data) }, token),

  updateProduct: (token: string, productId: string, data: Partial<ProductInput>) =>
    request<AdminProduct>(`${API_V2_ADMIN}/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteProduct: (token: string, productId: string) =>
    request<void>(`${API_V2_ADMIN}/products/${productId}`, { method: "DELETE" }, token),

  duplicateProduct: (token: string, productId: string) =>
    request<AdminProduct>(`${API_V2_ADMIN}/products/${productId}/duplicate`, {
      method: "POST",
    }, token),

  services: (token: string) =>
    request<Paginated<InstallationService>>(`${API_V2_ADMIN}/installation-services?limit=500`, {}, token).then(
      (res) => res.data,
    ),

  createService: (token: string, data: InstallationServiceInput) =>
    request<InstallationService>(`${API_V2_ADMIN}/installation-services`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  updateService: (token: string, id: string, data: Partial<InstallationServiceInput>) =>
    request<InstallationService>(`${API_V2_ADMIN}/installation-services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteService: (token: string, id: string) =>
    request<void>(`${API_V2_ADMIN}/installation-services/${id}`, { method: "DELETE" }, token),

  brands: (token: string) =>
    request<Paginated<Brand>>(`${API_V2_ADMIN}/brands?limit=500`, {}, token).then((res) => res.data),

  createBrand: (token: string, data: BrandInput) =>
    request<Brand>(`${API_V2_ADMIN}/brands`, { method: "POST", body: JSON.stringify(data) }, token),

  updateBrand: (token: string, id: string, data: Partial<BrandInput>) =>
    request<Brand>(`${API_V2_ADMIN}/brands/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteBrand: (token: string, id: string) =>
    request<void>(`${API_V2_ADMIN}/brands/${id}`, { method: "DELETE" }, token),

  blogPosts: (token: string) =>
    request<Paginated<BlogPost>>(`${API_V2_ADMIN}/blog-posts?limit=500`, {}, token).then((res) => res.data),

  createBlogPost: (token: string, data: BlogPostInput) =>
    request<BlogPost>(`${API_V2_ADMIN}/blog-posts`, { method: "POST", body: JSON.stringify(data) }, token),

  updateBlogPost: (token: string, id: string, data: Partial<BlogPostInput>) =>
    request<BlogPost>(`${API_V2_ADMIN}/blog-posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteBlogPost: (token: string, id: string) =>
    request<void>(`${API_V2_ADMIN}/blog-posts/${id}`, { method: "DELETE" }, token),

  portfolioWorks: (token: string) =>
    request<Paginated<PortfolioWork>>(`${API_V2_ADMIN}/portfolio-works?limit=500`, {}, token).then(
      (res) => res.data,
    ),

  createPortfolioWork: (token: string, data: PortfolioWorkInput) =>
    request<PortfolioWork>(`${API_V2_ADMIN}/portfolio-works`, { method: "POST", body: JSON.stringify(data) }, token),

  updatePortfolioWork: (token: string, id: string, data: Partial<PortfolioWorkInput>) =>
    request<PortfolioWork>(`${API_V2_ADMIN}/portfolio-works/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deletePortfolioWork: (token: string, id: string) =>
    request<void>(`${API_V2_ADMIN}/portfolio-works/${id}`, { method: "DELETE" }, token),

  categories: (token: string) =>
    request<Paginated<CategoryAdmin>>(`${API_V2_ADMIN}/categories?limit=500`, {}, token).then(
      (res) => res.data,
    ),

  category: (token: string, id: string) =>
    request<CategoryAdmin>(`${API_V2_ADMIN}/categories/${id}`, {}, token),

  createCategory: (token: string, data: CategoryInput) =>
    request<CategoryAdmin>(`${API_V2_ADMIN}/categories`, { method: "POST", body: JSON.stringify(data) }, token),

  updateCategory: (token: string, id: string, data: Partial<CategoryUpdateInput>) =>
    request<CategoryAdmin>(`${API_V2_ADMIN}/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  deleteCategory: (
    token: string,
    id: string,
    options?: { strategy?: "cascade" | "move"; moveToCategoryId?: string },
  ) => {
    const params = new URLSearchParams();
    if (options?.strategy) params.set("strategy", options.strategy);
    if (options?.moveToCategoryId) params.set("moveTo", options.moveToCategoryId);
    const query = params.toString();
    return request<void>(`${API_V2_ADMIN}/categories/${id}${query ? `?${query}` : ""}`, { method: "DELETE" }, token);
  },

  uploadCategoryImage: (token: string, categoryId: string, file: File) =>
    uploadRequest(`${API_V2_ADMIN}/categories/${categoryId}/images`, file, token),

  uploadProductImage: (token: string, file: File, productId?: string) =>
    uploadRequest(
      productId
        ? `${API_V2_ADMIN}/products/${productId}/images`
        : `${API_V2_ADMIN}/products/images`,
      file,
      token,
    ),

  uploadPortfolioImage: (token: string, file: File, portfolioId?: string) =>
    uploadRequest(
      portfolioId
        ? `${API_V2_ADMIN}/portfolio-works/${portfolioId}/images`
        : `${API_V2_ADMIN}/portfolio-works/images`,
      file,
      token,
    ),

  attributes: (token: string) =>
    request<Paginated<AttributeDef>>(`${API_V2_ADMIN}/attributes?limit=500`, {}, token).then(
      (res) => res.data,
    ),

  attribute: (token: string, id: string) =>
    request<AttributeDef>(`${API_V2_ADMIN}/attributes/${id}`, {}, token),

  createAttribute: (token: string, data: AttributeInput) =>
    request<AttributeDef>(`${API_V2_ADMIN}/attributes`, { method: "POST", body: JSON.stringify(data) }, token),

  updateAttribute: (token: string, id: string, data: Partial<AttributeInput>) =>
    request<AttributeDef>(`${API_V2_ADMIN}/attributes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  deleteAttribute: (token: string, id: string, options?: { cascade?: boolean }) => {
    const query = options?.cascade ? "?strategy=cascade" : "";
    return request<void>(`${API_V2_ADMIN}/attributes/${id}${query}`, { method: "DELETE" }, token);
  },

  categoryAttributes: (token: string, categoryId: string) =>
    request<CategoryAttributeLink[]>(`${API_V2_ADMIN}/categories/${categoryId}/attributes`, {}, token),

  categoryAttributeSchema: (token: string, categoryId: string) =>
    request<CategoryAttributeSchema[]>(
      `${API_V2_ADMIN}/categories/${categoryId}/attributes?view=form`,
      {},
      token,
    ),

  /** PUT — полная замена привязок; отсутствующие в items удаляются на сервере. */
  syncCategoryAttributes: (token: string, categoryId: string, items: CategoryAttributeSyncItem[]) =>
    request<CategoryAttributeLink[]>(`${API_V2_ADMIN}/categories/${categoryId}/attributes`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }, token),
};

export type OrderStatus = "new" | "confirmed" | "completed" | "cancelled";

export interface OrderListParams {
  limit?: number;
  offset?: number;
  q?: string;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export type OrderExportParams = Omit<OrderListParams, "limit" | "offset">;

export interface InstallationRequestListParams {
  limit?: number;
  offset?: number;
  q?: string;
  service?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type InstallationRequestExportParams = Omit<InstallationRequestListParams, "limit" | "offset">;

export type PaymentMethod = "cash" | "card" | "bank";

export interface DashboardStats {
  ordersNew: number;
  ordersTotal: number;
  reviewsPending: number;
  installationRequests: number;
}

export interface SiteStats {
  installationsCompleted: string;
  yearsExpertise: string;
}

export interface SiteStatsInput {
  installationsCompleted: string;
  yearsExpertise: string;
}

export interface SiteContact {
  phone: string;
  email: string;
  instagramUrl: string;
  tiktokUrl: string;
  telegramUrl: string;
  address: string;
  phoneTel: string;
  addressMapsUrl: string;
  mapEmbedUrl: string;
  mapLat: number | null;
  mapLon: number | null;
  workingHours: string;
}

export interface SiteContactInput {
  phone: string;
  email: string;
  instagramUrl: string;
  tiktokUrl: string;
  telegramUrl: string;
  address: string;
  mapLat: number | null;
  mapLon: number | null;
  workingHours: string;
}

export interface SiteAnnouncement {
  text: string;
  enabled: boolean;
  scrollDurationSeconds: number;
}

export interface SiteAnnouncementInput {
  text: string;
  enabled: boolean;
  scrollDurationSeconds: number;
}

export interface ProductHighlights {
  highlights: string[];
}

export interface ProductHighlightsInput {
  highlights: string[];
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
  filterType?: string | null;
  options: AttributeOption[];
}

export interface AttributeInput {
  id: string;
  label: string;
  valueType: string;
  unit?: string | null;
  filterType?: string | null;
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

export interface CategoryAttributeSyncItem extends CategoryAttributeInput {
  id?: number | null;
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
