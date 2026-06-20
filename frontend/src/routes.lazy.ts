import { lazyRoute } from "./lib/lazyRoute";

export const HomePage = lazyRoute(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage })),
);
export const CataloguePage = lazyRoute(() =>
  import("./pages/CataloguePage").then((m) => ({ default: m.CataloguePage })),
);
export const ProductPage = lazyRoute(() =>
  import("./pages/ProductPage").then((m) => ({ default: m.ProductPage })),
);
export const InstallationPage = lazyRoute(() =>
  import("./pages/InstallationPage").then((m) => ({ default: m.InstallationPage })),
);
export const BrandsPage = lazyRoute(() =>
  import("./pages/BrandsPage").then((m) => ({ default: m.BrandsPage })),
);
export const BlogPage = lazyRoute(() =>
  import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })),
);
export const BlogPostPage = lazyRoute(() =>
  import("./pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })),
);
export const AboutPage = lazyRoute(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
export const ContactPage = lazyRoute(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
export const DeliveryPage = lazyRoute(() =>
  import("./pages/DeliveryPage").then((m) => ({ default: m.DeliveryPage })),
);
export const PrivacyPage = lazyRoute(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
export const TermsPage = lazyRoute(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);
export const CartPage = lazyRoute(() =>
  import("./pages/CartPage").then((m) => ({ default: m.CartPage })),
);
export const CheckoutPage = lazyRoute(() =>
  import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
export const OrderSuccessPage = lazyRoute(() =>
  import("./pages/OrderSuccessPage").then((m) => ({ default: m.OrderSuccessPage })),
);
export const NotFoundPage = lazyRoute(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
