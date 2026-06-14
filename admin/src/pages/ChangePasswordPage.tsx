import { FormEvent, useState } from "react";
import { FormField, FormRequiredNote } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { STRONG_PASSWORD_HINT, STRONG_PASSWORD_MIN_LENGTH, validateStrongPassword } from "../lib/passwordPolicy";
import { ApiError, api } from "../lib/api";

export function ChangePasswordPage() {
  const { status, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordError = validateStrongPassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (status !== "authenticated") return;

    setSubmitting(true);
    try {
      await api.changePassword({
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

        <FormField label="Новый пароль" htmlFor="password-new" required hint={STRONG_PASSWORD_HINT}>
          <input
            id="password-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={STRONG_PASSWORD_MIN_LENGTH}
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
            minLength={STRONG_PASSWORD_MIN_LENGTH}
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
