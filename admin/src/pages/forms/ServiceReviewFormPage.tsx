import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { api } from "../../lib/api";

export function ServiceReviewFormPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [author, setAuthor] = useState("");
  const [car, setCar] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await api.createServiceReview(token, { author, car: car || undefined, rating, text, published: true });
      navigate("/reviews/service");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Новый отзыв" backTo="/reviews/service" />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid md:grid-cols-2 gap-4 max-w-2xl`}>
        <input placeholder="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} required />
        <input placeholder="Автомобиль (необязательно)" value={car} onChange={(e) => setCar(e.target.value)} className={inputClass} />
        <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className={inputClass} />
        <textarea placeholder="Текст отзыва" value={text} onChange={(e) => setText(e.target.value)} className={`md:col-span-2 ${textareaClass}`} required />
        <div className="md:col-span-2">
          <FormActions cancelTo="/reviews/service" submitLabel="Создать" isSubmitting={submitting} />
        </div>
      </form>
    </div>
  );
}
