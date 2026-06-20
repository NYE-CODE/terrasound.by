import { Suspense, useEffect, useState } from "react";
import { lazyRoute } from "../lib/lazyRoute";
import { Link } from "react-router";
import { Button } from "../components/atoms/Button";
import { api, type Brand, type PortfolioWork, type ProductCard as ProductCardData, type SiteStats } from "../lib/api";
import { useCategories } from "../context/CategoriesContext";
import { reportLoadError } from "../lib/loadError";
import { usePageMeta } from "../hooks/usePageMeta";
import { HOME_PAGE_DESCRIPTION, HOME_PAGE_TITLE } from "../lib/site";
import { pageTopOffsetClass } from "../lib/pageLayout";
import type { ServiceReview } from "@terrasound/shared";
import { HERO_IMAGE_HEIGHT, HERO_IMAGE_WIDTH, HERO_MOBILE_HEIGHT, HERO_MOBILE_WIDTH } from "../lib/brandAssets";
import heroDesktop from "../assets/hero-section.webp";
import heroMobile from "../assets/hero-section-mobile.webp";

const HomePageSections = lazyRoute(() =>
  import("./HomePageSections").then((m) => ({ default: m.HomePageSections })),
);

const HERO_SRCSET = `${heroMobile} ${HERO_MOBILE_WIDTH}w, ${heroDesktop} ${HERO_IMAGE_WIDTH}w`;

export function HomePage() {
  const categories = useCategories();
  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardData[]>([]);
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    installationsCompleted: "1200+",
    yearsExpertise: "8",
    enabled: false,
  });

  useEffect(() => {
    api
      .getSiteHome()
      .then((home) => {
        setServiceReviews(home.serviceReviews);
        setFeaturedProducts(home.featuredProducts);
        setPortfolioWorks(home.portfolioWorks);
        setBrands(home.brands);
        setSiteStats(home.stats);
      })
      .catch(reportLoadError);
  }, []);

  usePageMeta({
    title: HOME_PAGE_TITLE,
    description: HOME_PAGE_DESCRIPTION,
    path: "/",
  });

  return (
    <div className={pageTopOffsetClass}>
      {/* Hero Section */}
      <section className="relative isolate min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none lg:hidden" aria-hidden>
          <img
            src={heroMobile}
            srcSet={HERO_SRCSET}
            sizes="100vw"
            alt=""
            width={HERO_MOBILE_WIDTH}
            height={HERO_MOBILE_HEIGHT}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 z-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-[1] bg-background/75" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/50 to-background/30" />
        </div>

        <div className="relative z-[2] max-w-[1400px] mx-auto px-6 w-full py-8 md:py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight">
                Звук, который создан для вашего авто
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/catalogue" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full">Смотреть каталог</Button>
                </Link>
                <Link to={{ pathname: "/installation", hash: "#consultation" }} className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full">Записаться на консультацию</Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block aspect-[4/5] bg-secondary/30 rounded overflow-hidden">
              <img
                src={heroDesktop}
                srcSet={HERO_SRCSET}
                sizes="(min-width: 1024px) 50vw, 0px"
                alt="Салон автомобиля с премиальной аудиосистемой"
                width={HERO_IMAGE_WIDTH}
                height={HERO_IMAGE_HEIGHT}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomePageSections
          categories={categories}
          featuredProducts={featuredProducts}
          portfolioWorks={portfolioWorks}
          serviceReviews={serviceReviews}
          brands={brands}
          siteStats={siteStats}
        />
      </Suspense>
    </div>
  );
}
