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
  valueType: "text",
  unit: "",
  options: [],
};

function optionsToText(options: AttributeInput["options"]) {
  return (options ?? []).map((opt) => `${opt.value}: ${opt.label}`).join("\n");
}

function textToOptions(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const colon = line.indexOf(":");
      if (colon <= 0) return { value: line, label: line, sortOrder: index };
      return {
        value: line.slice(0, colon).trim(),
        label: line.slice(colon + 1).trim(),
        sortOrder: index,
      };
    });
}

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
        <input
          placeholder="ID (slug, напр. optical_input)"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          className={inputClass}
          required
          disabled={isEdit}
          pattern="^[a-z0-9]+(?:_[a-z0-9]+)*$"
        />
        <input
          placeholder="Название"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className={inputClass}
          required
        />
        <select
          value={form.valueType}
          onChange={(e) => setForm({ ...form, valueType: e.target.value })}
          className={inputClass}
        >
          <option value="text">Текст</option>
          <option value="number">Число</option>
          <option value="boolean">Да/нет</option>
          <option value="enum">Список</option>
        </select>
        <input
          placeholder="Единица измерения (необязательно)"
          value={form.unit ?? ""}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className={inputClass}
        />
        {form.valueType === "enum" && (
          <textarea
            placeholder="Варианты (value: подпись, по одному на строку)"
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            className={textareaClass}
          />
        )}
        <FormActions cancelTo="/attributes" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
