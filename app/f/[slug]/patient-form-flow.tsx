"use client";

import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormAnswerValue, FormAnswers, FormQuestion, PatientForm, PatientIdentity } from "@/lib/types";
import styles from "./patient-form.module.css";

type Props = {
  form: PatientForm;
};

const initialIdentity: PatientIdentity = {
  email: "",
  cpf: ""
};

export function PatientFormFlow({ form }: Props) {
  const needsIdentity = form.type === "patient_linked";
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState(initialIdentity);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const totalSteps = form.questions.length + (needsIdentity ? 1 : 0);
  const currentQuestion = needsIdentity ? form.questions[step - 1] : form.questions[step];
  const isIdentityStep = needsIdentity && step === 0;
  const isLastStep = step === totalSteps - 1;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const answeredQuestions = useMemo(
    () =>
      form.questions.filter((question) => {
        const value = answers[question.id];
        return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
      }).length,
    [answers, form.questions]
  );

  function setAnswer(questionId: string, value: FormAnswerValue) {
    setError("");
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function validateCurrentStep() {
    if (isIdentityStep) {
      if (!identity.email.includes("@") || identity.cpf.replace(/\D/g, "").length !== 11) {
        setError("Informe o email e o CPF cadastrados no consultorio.");
        return false;
      }
      return true;
    }

    if (currentQuestion?.required) {
      const value = answers[currentQuestion.id];
      const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
      if (empty) {
        setError("Esta pergunta e obrigatoria para continuar.");
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setError("");
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit() {
    if (!validateCurrentStep()) return;
    setStatus("sending");
    setError("");

    const response = await fetch(`/api/forms/${form.slug}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identity: needsIdentity ? identity : undefined,
        answers
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Nao foi possivel enviar suas respostas.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <section className={styles.card}>
        <div className={styles.doneIcon}>
          <Check size={34} />
        </div>
        <p className={styles.kicker}>Resposta enviada</p>
        <h1>Obrigado. Suas respostas foram registradas.</h1>
        <p className={styles.description}>
          Vou analisar seu check-in e usar essas informacoes para conduzir seu
          acompanhamento com mais precisao.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.topbar}>
        <div>
          <p className={styles.kicker}>Feedback365</p>
          <h1>{form.title}</h1>
        </div>
        <span className={styles.counter}>
          {step + 1}/{totalSteps}
        </span>
      </div>

      {form.description ? <p className={styles.description}>{form.description}</p> : null}

      <div className={styles.progressTrack} aria-label={`Progresso ${progress}%`}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.stepArea}>
        {isIdentityStep ? (
          <IdentityStep identity={identity} onChange={setIdentity} />
        ) : (
          <QuestionStep
            question={currentQuestion}
            value={currentQuestion ? answers[currentQuestion.id] : undefined}
            onChange={setAnswer}
          />
        )}
      </div>

      <div className={styles.metaRow}>
        <span>{answeredQuestions} respostas preenchidas</span>
        <span>{progress}% concluido</span>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className={styles.actions}>
        <button className="button secondary" type="button" onClick={goBack} disabled={step === 0 || status === "sending"}>
          <ArrowLeft size={18} />
          Voltar
        </button>
        {isLastStep ? (
          <button className="button" type="button" onClick={submit} disabled={status === "sending"}>
            {status === "sending" ? <Loader2 className={styles.spin} size={18} /> : <ClipboardCheck size={18} />}
            Enviar respostas
          </button>
        ) : (
          <button className="button" type="button" onClick={goNext}>
            Avancar
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}

function IdentityStep({
  identity,
  onChange
}: {
  identity: PatientIdentity;
  onChange: (identity: PatientIdentity) => void;
}) {
  return (
    <div className={styles.questionBlock}>
      <div>
        <h2>Antes de comecar, confirme seus dados.</h2>
        <p className={styles.questionHelp}>
          Use o mesmo email e CPF cadastrados no consultorio. Isso garante que
          suas respostas entrem no seu historico.
        </p>
      </div>
      <div className="field">
        <label htmlFor="patient-email">Email</label>
        <input
          id="patient-email"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
          type="email"
          value={identity.email}
          onChange={(event) => onChange({ ...identity, email: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="patient-cpf">CPF</label>
        <input
          id="patient-cpf"
          inputMode="numeric"
          maxLength={14}
          placeholder="000.000.000-00"
          value={identity.cpf}
          onChange={(event) => onChange({ ...identity, cpf: formatCpf(event.target.value) })}
        />
      </div>
    </div>
  );
}

function QuestionStep({
  question,
  value,
  onChange
}: {
  question?: FormQuestion;
  value?: FormAnswerValue;
  onChange: (questionId: string, value: FormAnswerValue) => void;
}) {
  if (!question) return null;

  return (
    <div className={styles.questionBlock}>
      <div>
        <h2>
          {question.label}
          {question.required ? <span aria-label="obrigatoria"> *</span> : null}
        </h2>
        {question.helperText ? <p className={styles.questionHelp}>{question.helperText}</p> : null}
      </div>
      <QuestionInput question={question} value={value} onChange={onChange} />
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange
}: {
  question: FormQuestion;
  value?: FormAnswerValue;
  onChange: (questionId: string, value: FormAnswerValue) => void;
}) {
  if (question.type === "long_text") {
    return (
      <textarea
        className={styles.bigInput}
        placeholder="Escreva com suas palavras..."
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(question.id, event.target.value)}
      />
    );
  }

  if (question.type === "number" || question.type === "weight") {
    return (
      <input
        className={styles.bigInput}
        inputMode="decimal"
        placeholder={question.type === "weight" ? "Ex: 78,4" : "Digite um numero"}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        onChange={(event) => onChange(question.id, event.target.value)}
      />
    );
  }

  if (question.type === "date") {
    return (
      <input
        className={styles.bigInput}
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(question.id, event.target.value)}
      />
    );
  }

  if (question.type === "scale") {
    const current = typeof value === "number" ? value : Number(value ?? 5);
    return (
      <div className={styles.scaleWrap}>
        <strong>{current}</strong>
        <input
          max={10}
          min={0}
          type="range"
          value={current}
          onChange={(event) => onChange(question.id, Number(event.target.value))}
        />
        <div className={styles.scaleLabels}>
          <span>0</span>
          <span>10</span>
        </div>
      </div>
    );
  }

  if (question.type === "yes_no") {
    return (
      <div className={styles.optionsGrid}>
        {["Sim", "Nao"].map((option) => (
          <button
            className={value === option ? styles.optionSelected : styles.option}
            key={option}
            type="button"
            onClick={() => onChange(question.id, option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "single_choice") {
    return (
      <div className={styles.optionsGrid}>
        {(question.options ?? []).map((option) => (
          <button
            className={value === option ? styles.optionSelected : styles.option}
            key={option}
            type="button"
            onClick={() => onChange(question.id, option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "multiple_choice") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className={styles.optionsGrid}>
        {(question.options ?? []).map((option) => {
          const active = selected.includes(option);
          return (
            <button
              className={active ? styles.optionSelected : styles.option}
              key={option}
              type="button"
              onClick={() =>
                onChange(
                  question.id,
                  active ? selected.filter((item) => item !== option) : [...selected, option]
                )
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <input
      className={styles.bigInput}
      placeholder="Digite sua resposta"
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(question.id, event.target.value)}
    />
  );
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
