import { lazy } from "react";

export const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage })),
);
export const CataloguePage = lazy(() =>
  import("./pages/CataloguePage").then((m) => ({ default: m.CataloguePage })),
);
export const ProductPage = lazy(() =>
  import("./pages/ProductPage").then((m) => ({ default: m.ProductPage })),
);
export const InstallationPage = lazy(() =>
  import("./pages/InstallationPage").then((m) => ({ default: m.InstallationPage })),
);
export const BrandsPage = lazy(() =>
  import("./pages/BrandsPage").then((m) => ({ default: m.BrandsPage })),
);
export const BlogPage = lazy(() =>
  import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })),
);
export const BlogPostPage = lazy(() =>
  import("./pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })),
);
export const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
export const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
export const DeliveryPage = lazy(() =>
  import("./pages/DeliveryPage").then((m) => ({ default: m.DeliveryPage })),
);
export const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
export const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);
export const CartPage = lazy(() =>
  import("./pages/CartPage").then((m) => ({ default: m.CartPage })),
);
export const CheckoutPage = lazy(() =>
  import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
export const OrderSuccessPage = lazy(() =>
  import("./pages/OrderSuccessPage").then((m) => ({ default: m.OrderSuccessPage })),
);
export const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
