import { Link } from "react-router";
import { ProductCard } from "../components/organisms/ProductCard";
import { ReviewCard } from "../components/organisms/ReviewCard";
import type { Brand, PortfolioWork, ProductCard as ProductCardData, SiteStats } from "../lib/api";
import { resolveMediaUrl } from "../lib/mediaUrl";
import type { Category } from "../lib/api";
import type { ServiceReview } from "@terrasound/shared";
import { pageSectionPy } from "../lib/pageLayout";
import { abbreviateLongWords } from "../lib/abbreviateText";

export interface HomePageSectionsProps {
  categories: Category[];
  featuredProducts: ProductCardData[];
  portfolioWorks: PortfolioWork[];
  serviceReviews: ServiceReview[];
  brands: Brand[];
  siteStats: SiteStats;
}

export function HomePageSections({
  categories,
  featuredProducts,
  portfolioWorks,
  serviceReviews,
  brands,
  siteStats,
}: HomePageSectionsProps) {
  return (
    <>
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
    </>
  );
}
