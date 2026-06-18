import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/organisms/layout/RootLayout";
import {
  AboutPage,
  BlogPage,
  BlogPostPage,
  BrandsPage,
  CartPage,
  CataloguePage,
  CheckoutPage,
  ContactPage,
  DeliveryPage,
  HomePage,
  InstallationPage,
  NotFoundPage,
  OrderSuccessPage,
  PrivacyPage,
  ProductPage,
  TermsPage,
} from "./routes.lazy";

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
