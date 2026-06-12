import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminLayout } from "./components/AdminLayout";
import { BlogPage } from "./pages/BlogPage";
import { BrandsPage } from "./pages/BrandsPage";
import { AttributesPage } from "./pages/AttributesPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InstallationRequestsPage } from "./pages/InstallationRequestsPage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductReviewsPage } from "./pages/ProductReviewsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ServiceReviewsPage } from "./pages/ServiceReviewsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { BlogFormPage } from "./pages/forms/BlogFormPage";
import { BrandFormPage } from "./pages/forms/BrandFormPage";
import { AttributeFormPage } from "./pages/forms/AttributeFormPage";
import { CategoryFormPage } from "./pages/forms/CategoryFormPage";
import { ProductFormPage } from "./pages/forms/ProductFormPage";
import { ServiceFormPage } from "./pages/forms/ServiceFormPage";
import { ServiceReviewFormPage } from "./pages/forms/ServiceReviewFormPage";
import { PortfolioFormPage } from "./pages/forms/PortfolioFormPage";
import { SiteContactPage } from "./pages/SiteContactPage";
import { SiteStatsPage } from "./pages/SiteStatsPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted-foreground)]">
        Проверка доступа...
      </div>
    );
  }

  if (!token || status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/new" element={<CategoryFormPage />} />
            <Route path="categories/:id/edit" element={<CategoryFormPage />} />
            <Route path="attributes" element={<AttributesPage />} />
            <Route path="attributes/new" element={<AttributeFormPage />} />
            <Route path="attributes/:id/edit" element={<AttributeFormPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/new" element={<ServiceFormPage />} />
            <Route path="services/:id/edit" element={<ServiceFormPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="brands/new" element={<BrandFormPage />} />
            <Route path="brands/:id/edit" element={<BrandFormPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/new" element={<BlogFormPage />} />
            <Route path="blog/:id/edit" element={<BlogFormPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="portfolio/new" element={<PortfolioFormPage />} />
            <Route path="portfolio/:id/edit" element={<PortfolioFormPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reviews/product" element={<ProductReviewsPage />} />
            <Route path="reviews/service" element={<ServiceReviewsPage />} />
            <Route path="reviews/service/new" element={<ServiceReviewFormPage />} />
            <Route path="installation" element={<InstallationRequestsPage />} />
            <Route path="settings/contact" element={<SiteContactPage />} />
            <Route path="settings/stats" element={<SiteStatsPage />} />
            <Route path="settings/password" element={<ChangePasswordPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
