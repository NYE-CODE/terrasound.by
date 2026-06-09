import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/organisms/layout/RootLayout";
import { HomePage } from "./pages/HomePage";
import { CataloguePage } from "./pages/CataloguePage";
import { ProductPage } from "./pages/ProductPage";
import { InstallationPage } from "./pages/InstallationPage";
import { BrandsPage } from "./pages/BrandsPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { DeliveryPage } from "./pages/DeliveryPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "catalogue", Component: CataloguePage },
      { path: "product/:id", Component: ProductPage },
      { path: "installation", Component: InstallationPage },
      { path: "brands", Component: BrandsPage },
      { path: "blog", Component: BlogPage },
      { path: "blog/:id", Component: BlogPostPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "delivery", Component: DeliveryPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "terms", Component: TermsPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "order-success/:orderId", Component: OrderSuccessPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
