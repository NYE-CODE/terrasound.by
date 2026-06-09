import { useState } from "react";
import { Button } from "../atoms/Button";
import { StarRatingInput } from "../atoms/StarRating";
import { FormField } from "../molecules/FormField";
import { MAX_REVIEW_TEXT_LENGTH } from "../../lib/cart";

export interface ProductReviewFormData {
  author: string;
  email: string;
  text: string;
  rating: number;
}

export interface ProductReviewFormProps {
  onSubmit: (data: ProductReviewFormData) => void;
  className?: string;
}

export function ProductReviewForm({ onSubmit, className = "" }: ProductReviewFormProps) {
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductReviewFormData, string>>>({});

  const validate = () => {
    const nextErrors: Partial<Record<keyof ProductReviewFormData, string>> = {};

    if (!author.trim()) nextErrors.author = "Укажите имя";
    if (!email.trim()) {
      nextErrors.email = "Укажите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Неверный формат email";
    }
    if (!text.trim()) nextErrors.text = "Напишите отзыв";
    if (text.trim().length < 10) nextErrors.text = "Минимум 10 символов";
    if (text.trim().length > MAX_REVIEW_TEXT_LENGTH) {
      nextErrors.text = `Максимум ${MAX_REVIEW_TEXT_LENGTH} символов`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      author: author.trim(),
      email: email.trim(),
      text: text.trim(),
      rating,
    });
    setAuthor("");
    setEmail("");
    setText("");
    setRating(5);
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-card border border-card-border rounded p-6 ${className}`.trim()}
    >
      <h3 className="font-heading text-xl mb-6">Оставить отзыв</h3>

      <div className="space-y-4">
        <div>
          <label className="block font-heading text-sm uppercase tracking-wider mb-2">
            Оценка
          </label>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Ваше имя"
            markRequired
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Как к вам обращаться"
            error={errors.author}
          />

          <FormField
            label="Email"
            markRequired
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ваш@email.com"
            error={errors.email}
          />
        </div>

        <div>
          <label className="block font-heading text-sm uppercase tracking-wider mb-2">
            Отзыв <span className="text-accent">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_REVIEW_TEXT_LENGTH))}
            rows={4}
            maxLength={MAX_REVIEW_TEXT_LENGTH}
            placeholder="Расскажите о своём опыте с товаром"
            className="w-full px-4 py-3 bg-input border border-border rounded text-foreground focus:border-accent focus:outline-none transition-all duration-300 resize-none"
          />
          {errors.text && <p className="text-xs text-destructive mt-1">{errors.text}</p>}
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Отправить отзыв
        </Button>

        <p className="text-xs text-muted-foreground">
          Email не публикуется на сайте. Отзыв появится после проверки модератором.
        </p>
      </div>
    </form>
  );
}
