"use client";

import { LockKeyhole, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Nao foi possivel entrar.");
      setLoading(false);
      return;
    }

    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form className={styles.loginCard} onSubmit={submit}>
      <div className={styles.lockIcon}>
        <LockKeyhole size={28} />
      </div>
      <p className={styles.kicker}>Feedback365</p>
      <h1>Entrar no painel</h1>
      <p className={styles.copy}>
        Acesse com sua chave administrativa para gerenciar pacientes,
        formularios e respostas.
      </p>
      <div className="field">
        <label htmlFor="admin-token">Chave administrativa</label>
        <input
          autoComplete="current-password"
          id="admin-token"
          placeholder="Digite sua chave"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? <Loader2 className={styles.spin} size={18} /> : <LockKeyhole size={18} />}
        Entrar
      </button>
    </form>
  );
}
