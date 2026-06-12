import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { reportFormError, reportLoadError} from "../../lib/formError";
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
    }).catch(reportLoadError).finally(() => setLoading(false));
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
        title={isEdit ? "Редактирование статьи" : "Новая статья"}
        backTo="/blog"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <FormRequiredNote />

        <FormField label="Заголовок" htmlFor="blog-title" required>
          <input
            id="blog-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Категория" htmlFor="blog-category" required>
          <input
            id="blog-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Краткое описание" htmlFor="blog-excerpt" required>
          <textarea
            id="blog-excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className={textareaClass}
            required
          />
        </FormField>

        <FormField label="Полный текст" htmlFor="blog-content" optional>
          <textarea
            id="blog-content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={textareaClass}
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликовано
        </label>

        <FormActions cancelTo="/blog" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
