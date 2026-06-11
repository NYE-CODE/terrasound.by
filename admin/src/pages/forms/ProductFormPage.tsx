import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductAttributeFields } from "../../components/ProductAttributeFields";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { reportFormError } from "../../lib/formError";
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
  const [imagesText, setImagesText] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [compatibilityText, setCompatibilityText] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryAdmin[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributeSchema, setAttributeSchema] = useState<CategoryAttributeSchema[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | number | boolean | null>>({});

  useEffect(() => {
    if (!token) return;
    Promise.all([api.categories(token), api.brands(token)])
      .then(([categoryItems, brandItems]) => {
        setCategories(categoryItems);
        setBrands(brandItems);
      })
      .catch(console.error);
  }, [token]);

  const brandNames = useMemo(() => new Set(brands.map((brand) => brand.name)), [brands]);
  const currentBrandMissing = Boolean(form.brand && !brandNames.has(form.brand));

  useEffect(() => {
    if (!token || !id) return;
    api.product(token, id).then((product) => {
      setForm({
        brand: product.brand,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice ?? null,
        category: product.category,
        imageUrl: product.imageUrl,
        specsShort: product.specsShort,
        inStock: product.inStock,
      });
      setImagesText(listToLines(product.images));
      setSpecsText(specsToText(product.specs));
      setCompatibilityText(listToLines(product.compatibility));
      setAttributeValues(product.attributes ?? {});
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !form.category) {
      setAttributeSchema([]);
      return;
    }
    api.categoryAttributeSchema(token, form.category).then(setAttributeSchema).catch(console.error);
  }, [token, form.category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const attributes = { ...attributeValues };
      for (const field of attributeSchema) {
        if (field.valueType === "boolean" && attributes[field.attributeId] === undefined) {
          attributes[field.attributeId] = false;
        }
      }

      const payload: ProductInput = {
        ...form,
        images: linesToList(imagesText),
        specs: textToSpecs(specsText),
        attributes,
        compatibility: linesToList(compatibilityText),
      };
      if (isEdit && id) {
        await api.updateProduct(token, id, payload);
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
        <div>
          <label className="block text-sm mb-1">Бренд</label>
          <select
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
        </div>
        <div>
          <label className="block text-sm mb-1">Название</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <Link
          to="/brands/new"
          className="md:col-span-2 -mt-2 text-xs text-[var(--accent)] hover:underline w-fit"
        >
          + Новый бренд
        </Link>
        <input type="number" step="0.01" placeholder="Цена" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} required />
        <input
          type="number"
          step="0.01"
          placeholder="Цена со скидкой (необязательно)"
          value={form.salePrice ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              salePrice: e.target.value === "" ? null : Number(e.target.value),
            })
          }
          className={inputClass}
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} required>
          <option value="">Выберите категорию</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input placeholder="URL главного изображения" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={`md:col-span-2 ${inputClass}`} required />
        <input placeholder="Краткие характеристики" value={form.specsShort} onChange={(e) => setForm({ ...form, specsShort: e.target.value })} className={`md:col-span-2 ${inputClass}`} />
        <textarea placeholder="Доп. изображения (по одному URL на строку)" value={imagesText} onChange={(e) => setImagesText(e.target.value)} className={`md:col-span-2 ${textareaClass}`} />
        <ProductAttributeFields
          schema={attributeSchema}
          values={attributeValues}
          onChange={(attributeId, value) =>
            setAttributeValues((prev) => ({ ...prev, [attributeId]: value }))
          }
        />
        <textarea placeholder="Доп. характеристики (ключ: значение)" value={specsText} onChange={(e) => setSpecsText(e.target.value)} className={`md:col-span-2 ${textareaClass}`} />
        <textarea placeholder="Совместимость (по одной модели на строку)" value={compatibilityText} onChange={(e) => setCompatibilityText(e.target.value)} className={`md:col-span-2 ${textareaClass}`} />
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
