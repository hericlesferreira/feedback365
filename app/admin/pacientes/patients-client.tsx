"use client";

import { Loader2, Plus, RefreshCw, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";

type PatientStatus = "active" | "inactive" | "lead";

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: PatientStatus;
  created_at: string;
};

type PatientForm = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  status: PatientStatus;
};

const initialForm: PatientForm = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  status: "active"
};

const statusLabel: Record<PatientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  lead: "Lead"
};

export function PatientsClient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const activeCount = useMemo(
    () => patients.filter((patient) => patient.status === "active").length,
    [patients]
  );

  async function loadPatients() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/patients");
    const payload = (await response.json().catch(() => null)) as
      | { patients?: Patient[]; message?: string }
      | null;

    setLoading(false);

    if (!response.ok) {
      setError(payload?.message ?? "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(payload?.patients ?? []);
    if (payload?.message) {
      setMessage(payload.message);
    }
  }

  useEffect(() => {
    void loadPatients();
  }, []);

  async function savePatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const payload = (await response.json().catch(() => null)) as
      | { patient?: Patient; message?: string }
      | null;

    setSaving(false);

    if (!response.ok) {
      setError(payload?.message ?? "Nao foi possivel cadastrar o paciente.");
      return;
    }

    setForm(initialForm);
    setMessage("Paciente cadastrado com sucesso.");
    await loadPatients();
  }

  return (
    <>
      <section className={styles.hero}>
        <div>
          <h1>Pacientes</h1>
          <p>
            Cadastre manualmente os pacientes que vao responder formularios
            vinculados. O CPF e usado apenas para validacao e fica salvo como hash.
          </p>
        </div>
        <button className="button secondary" type="button" onClick={loadPatients}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </section>

      <section className={styles.grid}>
        <div className={styles.stat}>
          <UserRound size={22} />
          <span>Total cadastrado</span>
          <strong>{patients.length}</strong>
        </div>
        <div className={styles.stat}>
          <UserRound size={22} />
          <span>Pacientes ativos</span>
          <strong>{activeCount}</strong>
        </div>
        <div className={styles.stat}>
          <UserRound size={22} />
          <span>Podem responder check-ins</span>
          <strong>{activeCount}</strong>
        </div>
      </section>

      <section className={styles.builder}>
        <form className={styles.builderPanel} onSubmit={savePatient}>
          <h2>Novo paciente</h2>
          <div className={styles.formGrid}>
            <div className="field">
              <label>Nome completo</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div className="field">
              <label>CPF</label>
              <input
                inputMode="numeric"
                maxLength={14}
                placeholder="000.000.000-00"
                required
                value={form.cpf}
                onChange={(event) => setForm({ ...form, cpf: formatCpf(event.target.value) })}
              />
            </div>
            <div className="field">
              <label>Telefone</label>
              <input
                inputMode="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as PatientStatus })
                }
              >
                <option value="active">Ativo</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            {message ? <p className="success">{message}</p> : null}
            {error ? <p className="error">{error}</p> : null}
            <button className="button" type="submit" disabled={saving}>
              {saving ? <Loader2 className={styles.spin} size={18} /> : <Plus size={18} />}
              Cadastrar paciente
            </button>
          </div>
        </form>

        <div className={styles.builderPanel}>
          <h2>Pacientes cadastrados</h2>
          {loading ? (
            <p className="hint">Carregando pacientes...</p>
          ) : patients.length === 0 ? (
            <p className="hint">
              Nenhum paciente cadastrado ainda. Cadastre o primeiro paciente pelo
              formulario ao lado.
            </p>
          ) : (
            <div className={styles.list}>
              {patients.map((patient) => (
                <div className={styles.item} key={patient.id}>
                  <div>
                    <strong>{patient.name}</strong>
                    <span>
                      {patient.email}
                      {patient.phone ? ` · ${patient.phone}` : ""}
                    </span>
                  </div>
                  <span className={styles.badge}>{statusLabel[patient.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
