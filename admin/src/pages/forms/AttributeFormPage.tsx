import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { api, type AttributeInput } from "../../lib/api";

const emptyForm: AttributeInput = {
  id: "",
  label: "",
  valueType: "enum",
  unit: "",
  options: [],
};

function optionsToText(options: AttributeInput["options"]) {
  return (options ?? []).map((opt) => (opt.value === opt.label ? opt.label : `${opt.value}: ${opt.label}`)).join("\n");
}

function textToOptions(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const colon = line.indexOf(":");
      if (colon <= 0) {
        const slug = line.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        return { value: slug || `opt_${index}`, label: line, sortOrder: index };
      }
      return {
        value: line.slice(0, colon).trim(),
        label: line.slice(colon + 1).trim(),
        sortOrder: index,
      };
    });
}

const TYPE_HINTS: Record<string, string> = {
  enum: "Выпадающий список или фильтр с вариантами (тип магнитолы, типоразмер и т.д.)",
  number: "Числовое значение (мощность, толщина). Можно задать ползунок в фильтрах категории.",
  boolean: "Да / нет (Bluetooth, оптический вход и т.п.)",
  text: "Произвольный текст без фиксированных вариантов",
};

export function AttributeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<AttributeInput>(emptyForm);
  const [optionsText, setOptionsText] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api.attributes(token).then((items) => {
      const item = items.find((attr) => attr.id === id);
      if (item) {
        setForm({
          id: item.id,
          label: item.label,
          valueType: item.valueType,
          unit: item.unit ?? "",
          options: item.options,
        });
        setOptionsText(optionsToText(item.options));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const payload: AttributeInput = {
        ...form,
        unit: form.unit || null,
        options: form.valueType === "enum" ? textToOptions(optionsText) : [],
      };
      if (isEdit && id) {
        const { id: _id, ...update } = payload;
        await api.updateAttribute(token, id, update);
      } else {
        await api.createAttribute(token, payload);
      }
      navigate("/attributes");
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
      <PageHeader title={isEdit ? "Редактирование атрибута" : "Новый атрибут"} backTo="/attributes" />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <div>
          <label className="block text-sm mb-1">Код (латиница, без пробелов)</label>
          <input
            placeholder="tip_dinamiki"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className={inputClass}
            required
            disabled={isEdit}
            pattern="^[a-z0-9]+(?:_[a-z0-9]+)*$"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Используется в системе, не показывается покупателю</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Название</label>
          <input
            placeholder="Тип"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Тип значения</label>
          <select
            value={form.valueType}
            onChange={(e) => setForm({ ...form, valueType: e.target.value })}
            className={inputClass}
          >
            <option value="enum">Список вариантов</option>
            <option value="number">Число</option>
            <option value="boolean">Да / нет</option>
            <option value="text">Текст</option>
          </select>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">{TYPE_HINTS[form.valueType]}</p>
        </div>

        {form.valueType === "number" && (
          <div>
            <label className="block text-sm mb-1">Единица измерения</label>
            <input
              placeholder="Вт, мм, Ом…"
              value={form.unit ?? ""}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className={inputClass}
            />
          </div>
        )}

        {form.valueType === "enum" && (
          <div>
            <label className="block text-sm mb-1">Варианты списка</label>
            <textarea
              placeholder={"Твитеры\nСреднечастотники\nСабвуферы\n\nили с кодом:\ntweeters: Твитеры"}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className={textareaClass}
              rows={6}
              required
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              По одному варианту на строку. Для списка «Тип динамика» выберите тип «Список вариантов», не «Текст».
            </p>
          </div>
        )}

        <FormActions cancelTo="/attributes" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
