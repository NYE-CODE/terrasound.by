import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { api, type BlogPostInput } from "../../lib/api";

const emptyForm: BlogPostInput = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  published: true,
};

export function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api.blogPosts(token).then((items) => {
      const item = items.find((p) => p.id === id);
      if (item) {
        setForm({
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          category: item.category,
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
        await api.updateBlogPost(token, id, form);
      } else {
        await api.createBlogPost(token, form);
      }
      navigate("/blog");
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
        title={isEdit ? "Редактирование статьи" : "Новая статья"}
        backTo="/blog"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <input placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required />
        <input placeholder="Категория" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} required />
        <textarea placeholder="Краткое описание" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={textareaClass} required />
        <textarea placeholder="Полный текст (необязательно)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={textareaClass} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликовано
        </label>
        <FormActions cancelTo="/blog" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
