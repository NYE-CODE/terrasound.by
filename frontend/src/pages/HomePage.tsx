import { Link } from "react-router";
import { Button } from "../components/atoms/Button";
import { ProductCard } from "../components/organisms/ProductCard";
import { useEffect, useState } from "react";
import { ReviewCard } from "../components/organisms/ReviewCard";
import { api, type Brand, type PortfolioWork, type ProductCard as ProductCardData, type SiteStats } from "../lib/api";
import { resolveMediaUrl } from "../lib/mediaUrl";
import { useCategories } from "../context/CategoriesContext";
import { reportLoadError } from "../lib/loadError";
import { usePageMeta } from "../hooks/usePageMeta";
import { TAGLINE } from "../lib/site";
import { pageContentPy, pageSectionPy, pageTopOffsetClass } from "../lib/pageLayout";
import { abbreviateLongWords } from "../lib/abbreviateText";
import type { ServiceReview } from "@terrasound/shared";
import { HERO_IMAGE_HEIGHT, HERO_IMAGE_WIDTH } from "../lib/brandAssets";
import heroSection from "../assets/hero-section.webp";

const HERO_IMAGE = heroSection;

export function HomePage() {
  const categories = useCategories();
  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardData[]>([]);
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    installationsCompleted: "1200+",
    yearsExpertise: "8",
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
    title: "Премиальный автозвук в Гродно",
    description: TAGLINE,
    path: "/",
  });

  return (
    <div className={pageTopOffsetClass}>
      {/* Hero Section */}
      <section className="relative isolate min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none lg:hidden" aria-hidden>
          <img
            src={HERO_IMAGE}
            alt=""
            width={HERO_IMAGE_WIDTH}
            height={HERO_IMAGE_HEIGHT}
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
                src={HERO_IMAGE}
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

      {/* Category Grid */}
      <section className={`${pageSectionPy} bg-background`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalogue?category=${category.id}`}
                className={`surface-card-interactive relative overflow-hidden flex items-end p-4 md:p-6 min-h-[160px] row-span-1 col-span-1 md:min-h-[180px] ${
                  category.gridCols === 2 ? "md:col-span-2" : ""
                } ${category.gridTall ? "md:row-span-2 md:min-h-[400px]" : ""}`}
              >
                <img
                  src={resolveMediaUrl(category.imageUrl)}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
                <h3
                  className="relative w-full text-center font-heading text-lg leading-tight md:text-left md:text-xl"
                  title={category.name}
                >
                  <span className="md:hidden">{abbreviateLongWords(category.name)}</span>
                  <span className="hidden md:inline">{category.name}</span>
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`${pageSectionPy} bg-card/50`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Популярные товары</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[280px]">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facts Section */}
      <section className={`${pageSectionPy} bg-background`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="font-heading text-4xl sm:text-5xl md:text-6xl mb-4 text-accent tabular-nums">
                {siteStats.installationsCompleted}
              </div>
              <div className="text-muted-foreground">Подобранных систем</div>
            </div>
            <div>
              <div className="font-heading text-4xl sm:text-5xl md:text-6xl mb-4 text-accent tabular-nums">
                {siteStats.yearsExpertise}
              </div>
              <div className="text-muted-foreground">Опыт установки и подбора систем</div>
            </div>
            <div>
              <div className="font-heading text-4xl sm:text-5xl md:text-6xl mb-4 text-accent">100%</div>
              <div className="text-muted-foreground">Профессионалы своего дела</div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className={`${pageSectionPy} bg-card/50`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Наши работы</h2>
          {portfolioWorks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioWorks.map((work) => (
                <div key={work.id} className="relative overflow-hidden rounded aspect-[4/3] group">
                  <img
                    src={resolveMediaUrl(work.imageUrl)}
                    alt={work.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                    <div className="text-sm font-heading">{work.title}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Работы скоро появятся</p>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className={`${pageSectionPy} bg-background`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Отзывы клиентов</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {serviceReviews.map((review) => (
              <ReviewCard key={review.id} variant="service" review={review} />
            ))}
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="py-8 md:py-12 border-t border-border">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex gap-12 justify-center items-center flex-wrap">
              {brands.map((brand) => (
                <div key={brand.id} className="font-heading text-xl text-muted-foreground opacity-60">
                  {brand.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
