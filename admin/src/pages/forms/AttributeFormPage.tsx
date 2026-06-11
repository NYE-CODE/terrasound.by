import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { optionsTextForEdit, textToOptions } from "../../lib/attributeOptions";
import {
  FILTER_TYPE_LABELS,
  allowedFilterTypes,
  defaultFilterType,
  filterTypeHint,
} from "../../lib/filterTypes";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { ApiError, api, type AttributeInput } from "../../lib/api";

const emptyForm: AttributeInput = {
  id: "",
  label: "",
  valueType: "enum",
  unit: "",
  filterType: "multiselect",
  options: [],
};

const TYPE_HINTS: Record<string, string> = {
  enum: "Фиксированный набор значений: тип магнитолы, типоразмер, материал.",
  number: "Число с единицей измерения: мощность, толщина, диаметр.",
  boolean: "Да / нет: Bluetooth, оптический вход, USB.",
  text: "Свободный текст — только в карточке товара, не в фильтрах.",
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

  const optionCount = useMemo(
    () => (form.valueType === "enum" ? textToOptions(optionsText).length : 0),
    [form.valueType, optionsText],
  );

  useEffect(() => {
    if (!token || !id) return;
    api
      .attribute(token, id)
      .then((item) => {
        setForm({
          id: item.id,
          label: item.label,
          valueType: item.valueType,
          unit: item.valueType === "number" ? (item.unit ?? "") : "",
          filterType: item.filterType ?? defaultFilterType(item.valueType, item.options.length),
          options: item.options,
        });
        setOptionsText(optionsTextForEdit(item.options, item.valueType, item.unit));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const options = form.valueType === "enum" ? textToOptions(optionsText) : [];
      const payload: AttributeInput = {
        ...form,
        unit: form.valueType === "number" ? (form.unit?.trim() || null) : null,
        filterType: defaultFilterType(form.valueType, options.length) === null
          ? null
          : (form.filterType ?? defaultFilterType(form.valueType, options.length)),
        options,
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
      if (error instanceof ApiError) alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const optionLineCount = optionsText.split("\n").filter((line) => line.trim()).length;
  const filterChoices = allowedFilterTypes(form.valueType);

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
            onChange={(e) => {
              const valueType = e.target.value;
              const count = valueType === "enum" ? optionCount : 0;
              setForm({
                ...form,
                valueType,
                unit: valueType === "number" ? form.unit : "",
                filterType: defaultFilterType(valueType, count),
              });
              if (valueType === "enum" && !optionsText.trim() && form.options?.length) {
                setOptionsText(optionsTextForEdit(form.options, valueType, form.unit));
              }
            }}
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
              className={`${textareaClass} whitespace-pre-wrap`}
              rows={Math.max(6, optionLineCount + 1)}
              required
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              По одному варианту на строку.
            </p>
          </div>
        )}

        {filterChoices.length > 0 && (
          <div>
            <label className="block text-sm mb-1">Вид в фильтрах каталога</label>
            {filterChoices.length === 1 ? (
              <p className="text-sm">{FILTER_TYPE_LABELS[filterChoices[0]]}</p>
            ) : (
              <select
                value={form.filterType ?? filterChoices[0]}
                onChange={(e) => setForm({ ...form, filterType: e.target.value })}
                className={inputClass}
              >
                {filterChoices.map((type) => (
                  <option key={type} value={type}>
                    {FILTER_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{filterTypeHint(form.valueType)}</p>
          </div>
        )}

        {form.valueType === "text" && (
          <p className="text-sm text-[var(--muted-foreground)]">{filterTypeHint("text")}</p>
        )}

        <FormActions cancelTo="/attributes" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
