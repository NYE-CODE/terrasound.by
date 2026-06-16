import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/organisms/layout/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () =>
          import("./pages/HomePage").then((m) => ({
            Component: m.HomePage,
            HydrateFallback: m.HomeHydrateFallback,
          })),
      },
      {
        path: "catalogue",
        lazy: () =>
          import("./pages/CataloguePage").then((m) => ({ Component: m.CataloguePage })),
      },
      {
        path: "product/:id",
        lazy: () =>
          import("./pages/ProductPage").then((m) => ({ Component: m.ProductPage })),
      },
      {
        path: "installation",
        lazy: () =>
          import("./pages/InstallationPage").then((m) => ({ Component: m.InstallationPage })),
      },
      {
        path: "brands",
        lazy: () =>
          import("./pages/BrandsPage").then((m) => ({ Component: m.BrandsPage })),
      },
      {
        path: "blog",
        lazy: () => import("./pages/BlogPage").then((m) => ({ Component: m.BlogPage })),
      },
      {
        path: "blog/:id",
        lazy: () =>
          import("./pages/BlogPostPage").then((m) => ({ Component: m.BlogPostPage })),
      },
      {
        path: "about",
        lazy: () => import("./pages/AboutPage").then((m) => ({ Component: m.AboutPage })),
      },
      {
        path: "contact",
        lazy: () =>
          import("./pages/ContactPage").then((m) => ({ Component: m.ContactPage })),
      },
      {
        path: "delivery",
        lazy: () =>
          import("./pages/DeliveryPage").then((m) => ({ Component: m.DeliveryPage })),
      },
      {
        path: "privacy",
        lazy: () =>
          import("./pages/PrivacyPage").then((m) => ({ Component: m.PrivacyPage })),
      },
      {
        path: "terms",
        lazy: () => import("./pages/TermsPage").then((m) => ({ Component: m.TermsPage })),
      },
      {
        path: "cart",
        lazy: () => import("./pages/CartPage").then((m) => ({ Component: m.CartPage })),
      },
      {
        path: "checkout",
        lazy: () =>
          import("./pages/CheckoutPage").then((m) => ({ Component: m.CheckoutPage })),
      },
      {
        path: "order-success/:orderId",
        lazy: () =>
          import("./pages/OrderSuccessPage").then((m) => ({ Component: m.OrderSuccessPage })),
      },
      {
        path: "*",
        lazy: () =>
          import("./pages/NotFoundPage").then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
]);
