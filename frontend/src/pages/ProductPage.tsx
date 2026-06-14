import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../components/atoms/Button";
import { Badge } from "../components/atoms/Badge";
import { Price } from "../components/atoms/Price";
import { StarRating } from "../components/atoms/StarRating";
import { JsonLd } from "../components/seo/JsonLd";
import { usePageMeta } from "../hooks/usePageMeta";
import { ProductImage } from "../components/atoms/ProductImage";
import { ReviewCard } from "../components/organisms/ReviewCard";
import { ProductReviewForm } from "../components/organisms/ProductReviewForm";
import type { ProductReviewFormData } from "../components/organisms/ProductReviewForm";
import { ProductHighlightsList } from "../components/molecules/ProductHighlightsList";
import { ProductPageTemplate } from "../components/templates/ProductPageTemplate";
import { Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { api, messageFromApiError, type ProductDetail } from "../lib/api";
import { getEffectivePrice } from "../lib/price";
import type { ProductReview } from "@terrasound/shared";
import { pageTopOffsetClass } from "../lib/pageLayout";

export function ProductPage() {
  const { id } = useParams();
  const productId = id ?? "1";
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<ProductReview[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoadError(false);
    api.getProduct(productId)
      .then(setProduct)
      .catch(() => setLoadError(true));
  }, [productId]);

  usePageMeta({
    title: product?.name ?? "Товар",
    description: product
      ? `${product.brand} ${product.name} — купить в Гродно. Цена ${getEffectivePrice(product.price, product.salePrice)} BYN.`
      : "Товар TerraSound — премиальный автозвук в Гродно.",
    path: `/product/${productId}`,
    image: product?.images[0],
    type: "product",
  });

  const productJsonLd = useMemo(() => {
    if (!product) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      brand: { "@type": "Brand", name: product.brand },
      image: product.images,
      description: product.specs ? Object.values(product.specs).join(", ") : product.name,
      offers: {
        "@type": "Offer",
        price: getEffectivePrice(product.price, product.salePrice),
        priceCurrency: "BYN",
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      },
      ...(product.ratingAvg
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.ratingAvg,
              reviewCount: product.reviewCount ?? 0,
            },
          }
        : {}),
    };
  }, [product]);

  const reviews = [...(product?.reviews ?? []), ...pendingReviews];

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productId,
        brand: product.brand,
        name: product.name,
        price: getEffectivePrice(product.price, product.salePrice),
        image: product.images[0],
      });
    }
    toast.success("Добавлено в корзину");
  };

  const handleReviewSubmit = async (data: ProductReviewFormData) => {
    try {
      const review = await api.createProductReview(productId, data);
      setPendingReviews((prev) => [...prev, review]);
      toast.success("Спасибо! Отзыв отправлен на модерацию");
    } catch (error) {
      toast.error(messageFromApiError(error, "Не удалось отправить отзыв"));
    }
  };

  const tabs = [
    { id: "specs", label: "Характеристики" },
    { id: "compatibility", label: "Совместимость" },
    { id: "reviews", label: "Отзывы" },
    { id: "tips", label: "Советы" },
  ];

  if (loadError) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center`}>
        <div className="text-center max-w-md px-6">
          <h1 className="font-heading text-4xl mb-4">Товар не найден</h1>
          <p className="text-muted-foreground mb-8">
            Возможно, товар снят с продажи или ссылка устарела
          </p>
          <Link to="/catalogue">
            <Button variant="primary">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center text-muted-foreground`}>
        Загрузка...
      </div>
    );
  }

  return (
    <>
      {productJsonLd && <JsonLd id="product" data={productJsonLd} />}
      <ProductPageTemplate
      gallery={
        <>
          <div className="aspect-square bg-secondary/30 rounded mb-4 overflow-hidden">
            <ProductImage
              src={product.images[selectedImage] ?? product.images[0] ?? ""}
              alt={product.name}
            />
          </div>
          <div className="flex gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square w-20 bg-secondary/30 rounded overflow-hidden border-2 transition-all duration-300 ${
                  selectedImage === index ? "border-accent" : "border-transparent"
                }`}
              >
                <ProductImage src={image} alt={`Вид ${index + 1}`} />
              </button>
            ))}
          </div>
        </>
      }
      info={
        <>
          <div className="text-sm text-accent font-heading uppercase tracking-wider mb-2">
            {product.brand}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-4">{product.name}</h1>

          {product.ratingAvg != null && product.ratingAvg > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <StarRating rating={product.ratingAvg} size={16} showValue />
              {product.reviewCount != null && product.reviewCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {product.reviewCount} отзывов
                </span>
              )}
            </div>
          )}

          <div className="mb-6">
            <Badge
              text={product.inStock ? "В наличии" : "Под заказ"}
              variant={product.inStock ? "success" : "preorder"}
              size="md"
            />
          </div>

          <Price amount={product.price} saleAmount={product.salePrice} size="xl" className="mb-8" />

          <div className="space-y-4 mb-8">
            {product.inStock ? (
              <>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-heading uppercase tracking-wider">Количество</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-secondary border border-border rounded flex items-center justify-center hover:border-accent transition-all duration-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-heading">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-secondary border border-border rounded flex items-center justify-center hover:border-accent transition-all duration-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button variant="primary" className="w-full" onClick={handleAddToCart}>
                  В корзину
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Товар сейчас отсутствует на складе, но доступен под заказ. Свяжитесь с нами — уточним сроки и стоимость.
                </p>
                <Link to="/contact" className="block">
                  <Button variant="ghost" className="w-full">
                    Уточнить наличие
                  </Button>
                </Link>
              </>
            )}
          </div>

          <ProductHighlightsList />
        </>
      }
      details={
        <div className="border-t border-border pt-12">
          <div className="flex gap-4 sm:gap-8 mb-8 border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-heading text-sm uppercase tracking-wider relative transition-colors duration-300 whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "specs" && (() => {
            const attributeSpecs = (product.attributeSpecs ?? []).filter(
              (spec) => spec.value.trim().length > 0,
            );
            const legacySpecs = Object.entries(product.specs).filter(
              ([, value]) => value.trim().length > 0,
            );

            return (
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                {attributeSpecs.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-3 border-b border-border gap-4">
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-heading text-right">{spec.value}</span>
                  </div>
                ))}
                {legacySpecs.map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-border gap-4">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-heading text-right">{value}</span>
                  </div>
                ))}
                {attributeSpecs.length === 0 && legacySpecs.length === 0 && (
                  <p className="text-muted-foreground md:col-span-2">Характеристики не указаны.</p>
                )}
              </div>
            );
          })()}

          {activeTab === "compatibility" && (
            <div>
              <h3 className="font-heading text-xl mb-6">Совместимые автомобили</h3>
              <div className="space-y-3">
                {product.compatibility.map((vehicle, index) => (
                  <div key={index} className="flex items-center gap-3 py-3 border-b border-border">
                    <Check size={16} className="text-accent" />
                    <span>{vehicle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              <ProductReviewForm onSubmit={handleReviewSubmit} />

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} variant="product" review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Пока нет отзывов об этом товаре.</p>
              )}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="prose prose-invert max-w-none">
              <h3 className="font-heading text-xl mb-4">Советы по установке</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>Для оптимального качества звука рекомендуется профессиональная установка</li>
                <li>Для лучшей производительности требуется шумоизоляция</li>
                <li>Лучше всего работает с 4-канальным усилителем (80 Вт+ на канал)</li>
                <li>Рекомендуется акустическая калибровка после установки</li>
              </ul>
            </div>
          )}
        </div>
      }
    />
    </>
  );
}
