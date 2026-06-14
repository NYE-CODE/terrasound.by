import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductAttributeFields } from "../../components/ProductAttributeFields";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
import { ImageUploadField } from "../../components/ImageUploadField";
import { ProductImagesField } from "../../components/ProductImagesField";
import { MoneyInput } from "../../components/MoneyInput";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { reportFormError, reportLoadError} from "../../lib/formError";
import { effectivePrice, formatMoney, isOnSale, roundMoney } from "../../lib/money";
import { api, type Brand, type CategoryAdmin, type CategoryAttributeSchema, type ProductInput } from "../../lib/api";

const emptyForm: ProductInput = {
  brand: "",
  name: "",
  price: 0,
  salePrice: null,
  category: "",
  imageUrl: "",
  specsShort: "",
  inStock: true,
};

function linesToList(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function listToLines(items: string[]) {
  return items.join("\n");
}

function specsToText(specs: Record<string, string>) {
  return Object.entries(specs).map(([key, val]) => `${key}: ${val}`).join("\n");
}

function textToSpecs(value: string) {
  const specs: Record<string, string> = {};
  for (const line of linesToList(value)) {
    const colon = line.indexOf(":");
    if (colon > 0) specs[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return specs;
}

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [specsText, setSpecsText] = useState("");
  const [compatibilityText, setCompatibilityText] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryAdmin[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributeSchema, setAttributeSchema] = useState<CategoryAttributeSchema[]>([]);
  const [attributeSchemaLoading, setAttributeSchemaLoading] = useState(false);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | number | boolean | null>>({});

  useEffect(() => {
    if (!token) return;
    Promise.all([api.categories(token), api.brands(token)])
      .then(([categoryItems, brandItems]) => {
        setCategories(categoryItems);
        setBrands(brandItems);
      })
      .catch(reportLoadError);
  }, [token]);

  const brandNames = useMemo(() => new Set(brands.map((brand) => brand.name)), [brands]);
  const currentBrandMissing = Boolean(form.brand && !brandNames.has(form.brand));

  useEffect(() => {
    if (!token || !id) return;
    api.product(token, id).then((product) => {
      setForm({
        brand: product.brand,
        name: product.name,
        price: roundMoney(product.price),
        salePrice: product.salePrice != null ? roundMoney(product.salePrice) : null,
        category: product.category,
        imageUrl: product.imageUrl,
        specsShort: product.specsShort,
        inStock: product.inStock,
      });
      setGalleryImages(product.images.filter((url) => url !== product.imageUrl));
      setSpecsText(specsToText(product.specs));
      setCompatibilityText(listToLines(product.compatibility));
      setAttributeValues(product.attributes ?? {});
    }).catch(reportLoadError).finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !form.category) {
      setAttributeSchema([]);
      setAttributeSchemaLoading(false);
      return;
    }
    setAttributeSchemaLoading(true);
    api
      .categoryAttributeSchema(token, form.category)
      .then((schema) => {
        setAttributeSchema(schema);
        setAttributeValues((prev) => {
          const next: Record<string, string | number | boolean | null> = {};
          for (const field of schema) {
            if (field.attributeId in prev) {
              next[field.attributeId] = prev[field.attributeId];
            }
          }
          return next;
        });
      })
      .catch(reportLoadError)
      .finally(() => setAttributeSchemaLoading(false));
  }, [token, form.category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (attributeSchemaLoading) {
      alert("Подождите, загружаются характеристики товара.");
      return;
    }

    if (!form.imageUrl.trim()) {
      alert("Загрузите главное изображение товара.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: ProductInput = {
        ...form,
        price: roundMoney(form.price),
        salePrice: form.salePrice != null ? roundMoney(form.salePrice) : null,
        images: galleryImages,
        specs: textToSpecs(specsText),
        compatibility: linesToList(compatibilityText),
      };

      if (attributeSchema.length > 0) {
        const attributes: Record<string, string | number | boolean | null> = {};
        for (const field of attributeSchema) {
          let value = attributeValues[field.attributeId];
          if (field.valueType === "boolean" && value === undefined) {
            value = false;
          }
          if (value !== undefined) {
            attributes[field.attributeId] = value;
          }
        }
        payload.attributes = attributes;
      }
      if (isEdit && id) {
        const updatePayload: Partial<ProductInput> = {
          brand: payload.brand,
          name: payload.name,
          price: payload.price,
          salePrice: payload.salePrice,
          category: payload.category,
          imageUrl: payload.imageUrl,
          specsShort: payload.specsShort,
          inStock: payload.inStock,
          images: payload.images,
          specs: payload.specs,
          compatibility: payload.compatibility,
        };
        if (payload.attributes !== undefined) {
          updatePayload.attributes = payload.attributes;
        }
        await api.updateProduct(token, id, updatePayload);
      } else {
        await api.createProduct(token, payload);
      }
      navigate("/products");
    } catch (error) {
      reportFormError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-[var(--muted-foreground)]">Загрузка...</div>;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Редактирование товара" : "Новый товар"}
        backTo="/products"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid md:grid-cols-2 gap-4 max-w-4xl`}>
        <FormRequiredNote className="md:col-span-2" />

        <FormField label="Бренд" htmlFor="product-brand" required>
          <select
            id="product-brand"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className={inputClass}
            required
          >
            <option value="">Выберите бренд</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
                {!brand.published ? " (скрыт)" : ""}
              </option>
            ))}
            {currentBrandMissing && (
              <option value={form.brand}>{form.brand} (нет в справочнике)</option>
            )}
          </select>
        </FormField>

        <FormField label="Название" htmlFor="product-name" required>
          <input
            id="product-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <Link
          to="/brands/new"
          className="md:col-span-2 -mt-2 text-xs text-[var(--accent)] hover:underline w-fit"
        >
          + Новый бренд
        </Link>

        <FormField label="Цена, BYN" htmlFor="product-price" required>
          <MoneyInput
            id="product-price"
            value={form.price}
            onValueChange={(price) =>
              setForm((prev) => {
                const next = { ...prev, price };
                if (prev.salePrice != null && price > 0 && prev.salePrice >= price) {
                  next.salePrice = null;
                }
                return next;
              })
            }
            required
          />
        </FormField>

        <FormField
          label="Цена со скидкой, BYN"
          htmlFor="product-sale-price"
          optional
          hint="Если заполнено и меньше обычной цены — на сайте покупатели увидят именно его."
        >
          <MoneyInput
            id="product-sale-price"
            value={form.salePrice}
            onValueChange={(salePrice) =>
              setForm({
                ...form,
                salePrice: salePrice > 0 ? salePrice : null,
              })
            }
          />
        </FormField>

        {isOnSale(form.price, form.salePrice) && (
          <p className="md:col-span-2 text-sm rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2">
            На сайте будет отображаться{" "}
            <strong>{formatMoney(effectivePrice(form.price, form.salePrice))} BYN</strong>
            {" "}(обычная цена {formatMoney(form.price)} BYN зачёркнута).
            Чтобы показывалась только цена {formatMoney(form.price)} BYN — очистите поле «Цена со скидкой».
          </p>
        )}

        <FormField
          label="Категория"
          htmlFor="product-category"
          required
          hint="После выбора категории появятся её обязательные характеристики."
          className="md:col-span-2"
        >
          <select
            id="product-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </FormField>

        <ImageUploadField
          label="Главное изображение"
          htmlFor="product-main-image"
          required
          value={form.imageUrl}
          onChange={(imageUrl) => setForm({ ...form, imageUrl })}
          onUpload={async (file) => {
            if (!token) throw new Error("Нужна авторизация");
            return api.uploadProductImage(token, file, isEdit ? id : undefined);
          }}
        />

        <FormField label="Краткие характеристики" htmlFor="product-specs-short" optional className="md:col-span-2">
          <input
            id="product-specs-short"
            value={form.specsShort}
            onChange={(e) => setForm({ ...form, specsShort: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <div className="md:col-span-2">
          <ProductImagesField
            images={galleryImages}
            onChange={setGalleryImages}
            onUpload={async (file) => {
              if (!token) throw new Error("Нужна авторизация");
              return api.uploadProductImage(token, file, isEdit ? id : undefined);
            }}
          />
        </div>
        {attributeSchemaLoading ? (
          <p className="md:col-span-2 text-sm text-[var(--muted-foreground)]">Загрузка характеристик товара…</p>
        ) : (
          <ProductAttributeFields
            schema={attributeSchema}
            values={attributeValues}
            onChange={(attributeId, value) =>
              setAttributeValues((prev) => ({ ...prev, [attributeId]: value }))
            }
          />
        )}
        <FormField
          label="Дополнительные характеристики"
          htmlFor="product-specs"
          optional
          hint="Формат: ключ: значение, по одной паре на строку."
          className="md:col-span-2"
        >
          <textarea
            id="product-specs"
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            className={textareaClass}
          />
        </FormField>

        <FormField
          label="Совместимость"
          htmlFor="product-compatibility"
          optional
          hint="По одной модели автомобиля на строку."
          className="md:col-span-2"
        >
          <textarea
            id="product-compatibility"
            value={compatibilityText}
            onChange={(e) => setCompatibilityText(e.target.value)}
            className={textareaClass}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
          В наличии
        </label>
        <div className="md:col-span-2">
          <FormActions cancelTo="/products" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
        </div>
      </form>
    </div>
  );
}
