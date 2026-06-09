import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { api, type CategoryAdmin, type ProductInput } from "../../lib/api";

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

  useEffect(() => {
    if (!token) return;
    api.categories(token).then(setCategories).catch(console.error);
  }, [token]);

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
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const payload: ProductInput = {
        ...form,
        images: linesToList(imagesText),
        specs: textToSpecs(specsText),
        compatibility: linesToList(compatibilityText),
      };
      if (isEdit && id) {
        await api.updateProduct(token, id, payload);
      } else {
        await api.createProduct(token, payload);
      }
      navigate("/products");
    } catch (error) {
      console.error(error);
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
        <input placeholder="Бренд" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} required />
        <input placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
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
        <textarea placeholder="Характеристики (ключ: значение)" value={specsText} onChange={(e) => setSpecsText(e.target.value)} className={`md:col-span-2 ${textareaClass}`} />
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
