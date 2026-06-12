import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { reportFormError } from "../../lib/formError";
import { parseRequiredInt } from "../../lib/numbers";
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
      reportFormError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Новый отзыв" backTo="/reviews/service" />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid md:grid-cols-2 gap-4 max-w-2xl`}>
        <FormRequiredNote className="md:col-span-2" />

        <FormField label="Автор" htmlFor="review-author" required>
          <input
            id="review-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Автомобиль" htmlFor="review-car" optional>
          <input
            id="review-car"
            value={car}
            onChange={(e) => setCar(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Оценка" htmlFor="review-rating" required hint="От 1 до 5">
          <input
            id="review-rating"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(parseRequiredInt(e.target.value, rating))}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Текст отзыва" htmlFor="review-text" required className="md:col-span-2">
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={textareaClass}
            required
          />
        </FormField>

        <div className="md:col-span-2">
          <FormActions cancelTo="/reviews/service" submitLabel="Создать" isSubmitting={submitting} />
        </div>
      </form>
    </div>
  );
}
