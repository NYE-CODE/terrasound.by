import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function LoginPage() {
  const { status, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-8"
      >
        <h1 className="font-heading text-3xl mb-2">TerraSound Admin</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">Вход в панель управления</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Логин</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full h-11 px-4 bg-[var(--input)] border border-[var(--border)] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-11 px-4 bg-[var(--input)] border border-[var(--border)] rounded"
              required
            />
          </div>
          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded disabled:opacity-60"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}
