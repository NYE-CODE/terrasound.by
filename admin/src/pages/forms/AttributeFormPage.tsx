import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
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
import { reportFormError, reportLoadError} from "../../lib/formError";
import { api, type AttributeInput } from "../../lib/api";

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
      .catch(reportLoadError)
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
      };
      if (form.valueType === "enum") {
        payload.options = options;
      } else {
        delete payload.options;
      }
      if (isEdit && id) {
        const update: Partial<AttributeInput> = {
          label: payload.label,
          valueType: payload.valueType,
          unit: payload.unit,
          filterType: payload.filterType,
        };
        if (form.valueType === "enum") {
          update.options = options;
        }
        await api.updateAttribute(token, id, update);
      } else {
        await api.createAttribute(token, payload);
      }
      navigate("/attributes");
    } catch (error) {
      reportFormError(error);
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
        <FormRequiredNote />

        <FormField
          label="Код"
          htmlFor="attribute-id"
          required={!isEdit}
          hint="Латиница и подчёркивания. Используется в системе, не показывается покупателю."
        >
          <input
            id="attribute-id"
            placeholder="tip_dinamiki"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className={inputClass}
            required={!isEdit}
            disabled={isEdit}
            pattern="^[a-z0-9]+(?:_[a-z0-9]+)*$"
          />
        </FormField>

        <FormField label="Название" htmlFor="attribute-label" required>
          <input
            id="attribute-label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Тип значения" htmlFor="attribute-value-type" hint={TYPE_HINTS[form.valueType]}>
          <select
            id="attribute-value-type"
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
        </FormField>

        {form.valueType === "number" && (
          <FormField label="Единица измерения" htmlFor="attribute-unit" optional hint="Например: Вт, мм, Ом">
            <input
              id="attribute-unit"
              value={form.unit ?? ""}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className={inputClass}
            />
          </FormField>
        )}

        {form.valueType === "enum" && (
          <FormField
            label="Варианты списка"
            htmlFor="attribute-options"
            required
            hint="По одному варианту на строку. Можно указать код: tweeters: Твитеры"
          >
            <textarea
              id="attribute-options"
              placeholder={"Твитеры\nСреднечастотники\nСабвуферы"}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className={`${textareaClass} whitespace-pre-wrap`}
              rows={Math.max(6, optionLineCount + 1)}
              required
            />
          </FormField>
        )}

        {filterChoices.length > 0 && (
          <FormField
            label="Вид в фильтрах каталога"
            htmlFor="attribute-filter-type"
            optional
            hint={filterTypeHint(form.valueType)}
          >
            {filterChoices.length === 1 ? (
              <p className="text-sm h-11 flex items-center">{FILTER_TYPE_LABELS[filterChoices[0]]}</p>
            ) : (
              <select
                id="attribute-filter-type"
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
          </FormField>
        )}

        {form.valueType === "text" && (
          <p className="text-sm text-[var(--muted-foreground)]">{filterTypeHint("text")}</p>
        )}

        <FormActions cancelTo="/attributes" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
