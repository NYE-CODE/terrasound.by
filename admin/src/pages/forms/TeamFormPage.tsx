import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass } from "../../lib/formStyles";
import { api, type TeamMemberInput } from "../../lib/api";

const emptyForm: TeamMemberInput = {
  name: "",
  specialty: "",
  imageUrl: "",
  sortOrder: 0,
  published: true,
};

export function TeamFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api.teamMembers(token).then((items) => {
      const item = items.find((m) => m.id === id);
      if (item) {
        setForm({
          name: item.name,
          specialty: item.specialty,
          imageUrl: item.imageUrl,
          sortOrder: item.sortOrder,
          published: item.published,
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updateTeamMember(token, id, form);
      } else {
        await api.createTeamMember(token, form);
      }
      navigate("/team");
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
        title={isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}
        backTo="/team"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <input placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        <input placeholder="Специализация" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className={inputClass} required />
        <input placeholder="URL фото" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} required />
        <input type="number" placeholder="Порядок сортировки" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликован
        </label>
        <FormActions cancelTo="/team" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
