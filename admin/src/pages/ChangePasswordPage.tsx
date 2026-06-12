import { FormEvent, useState } from "react";
import { FormField, FormRequiredNote } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { ApiError, api } from "../lib/api";

export function ChangePasswordPage() {
  const { token, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Новый пароль должен быть не короче 8 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (!token) return;

    setSubmitting(true);
    try {
      await api.changePassword(token, {
        currentPassword,
        newPassword,
      });
      logout();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сменить пароль");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Смена пароля" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        После сохранения вы будете перенаправлены на страницу входа. Войдите с новым паролем.
      </p>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-xl space-y-4`}>
        <FormRequiredNote />

        <FormField label="Текущий пароль" htmlFor="password-current" required>
          <input
            id="password-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Новый пароль" htmlFor="password-new" required hint="Не короче 8 символов">
          <input
            id="password-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Подтверждение пароля" htmlFor="password-confirm" required>
          <input
            id="password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            className={inputClass}
            required
          />
        </FormField>

        {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded disabled:opacity-60"
        >
          {submitting ? "Сохранение..." : "Сменить пароль"}
        </button>
      </form>
    </div>
  );
}
