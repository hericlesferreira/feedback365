"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { QuestionType } from "@/lib/types";
import styles from "../../admin.module.css";

type BuilderQuestion = {
  label: string;
  type: QuestionType;
  required: boolean;
  helperText: string;
  optionsText: string;
};

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "short_text", label: "Resposta curta" },
  { value: "long_text", label: "Texto longo" },
  { value: "number", label: "Numero" },
  { value: "date", label: "Data" },
  { value: "yes_no", label: "Sim/Nao" },
  { value: "single_choice", label: "Multipla escolha" },
  { value: "multiple_choice", label: "Checkbox" },
  { value: "scale", label: "Escala 0 a 10" },
  { value: "weight", label: "Peso" }
];

const blankQuestion: BuilderQuestion = {
  label: "",
  type: "short_text",
  required: true,
  helperText: "",
  optionsText: ""
};

export function FormBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "patient_linked">("patient_linked");
  const [questions, setQuestions] = useState<BuilderQuestion[]>([
    { ...blankQuestion, label: "Qual foi seu peso mais recente?", type: "weight" },
    { ...blankQuestion, label: "De 0 a 10, como foi sua adesao ao plano?", type: "scale" }
  ]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateQuestion(index: number, patch: Partial<BuilderQuestion>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      )
    );
  }

  function addQuestion() {
    setQuestions((current) => [...current, { ...blankQuestion }]);
  }

  function removeQuestion(index: number) {
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
  }

  async function saveForm() {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/forms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        type,
        questions: questions.map((question) => ({
          label: question.label,
          type: question.type,
          required: question.required,
          helperText: question.helperText,
          options: question.optionsText
            .split("\n")
            .map((option) => option.trim())
            .filter(Boolean)
        }))
      })
    });

    const payload = (await response.json().catch(() => null)) as { message?: string; slug?: string } | null;
    setSaving(false);

    if (!response.ok) {
      setMessage(payload?.message ?? "Nao foi possivel salvar.");
      return;
    }

    setMessage(`Formulario criado. Link: /f/${payload?.slug}`);
  }

  return (
    <>
      <section className={styles.hero}>
        <div>
          <h1>Novo formulario</h1>
          <p>
            Monte as perguntas em ordem. No formulario do paciente, cada pergunta
            aparecera em uma tela separada com progresso.
          </p>
        </div>
        <button className="button" type="button" onClick={saveForm} disabled={saving}>
          <Save size={18} />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </section>

      <section className={styles.builder}>
        <div className={styles.builderPanel}>
          <h2>Configuracao</h2>
          <div className={styles.formGrid}>
            <div className="field">
              <label>Nome do formulario</label>
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={type} onChange={(event) => setType(event.target.value as typeof type)}>
                <option value="patient_linked">Vinculado ao paciente</option>
                <option value="public">Publico</option>
              </select>
            </div>
            <div className="field">
              <label>Descricao</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            {message ? (
              <p className={message.startsWith("Formulario criado") ? "success" : "error"}>{message}</p>
            ) : null}
          </div>
        </div>

        <div className={styles.builderPanel}>
          <h2>Perguntas</h2>
          <div className={styles.formGrid}>
            {questions.map((question, index) => (
              <div className={styles.questionEditor} key={index}>
                <div className={styles.row}>
                  <div className="field">
                    <label>Pergunta {index + 1}</label>
                    <input
                      value={question.label}
                      onChange={(event) => updateQuestion(index, { label: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Tipo</label>
                    <select
                      value={question.type}
                      onChange={(event) =>
                        updateQuestion(index, { type: event.target.value as QuestionType })
                      }
                    >
                      {questionTypes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Texto de ajuda</label>
                  <input
                    value={question.helperText}
                    onChange={(event) => updateQuestion(index, { helperText: event.target.value })}
                  />
                </div>
                {(question.type === "single_choice" || question.type === "multiple_choice") && (
                  <div className="field">
                    <label>Opcoes, uma por linha</label>
                    <textarea
                      value={question.optionsText}
                      onChange={(event) => updateQuestion(index, { optionsText: event.target.value })}
                    />
                  </div>
                )}
                <div className={styles.toolbar}>
                  <label className="hint">
                    <input
                      checked={question.required}
                      type="checkbox"
                      onChange={(event) => updateQuestion(index, { required: event.target.checked })}
                    />{" "}
                    Obrigatoria
                  </label>
                  <button className="button ghost" type="button" onClick={() => removeQuestion(index)}>
                    <Trash2 size={17} />
                    Remover
                  </button>
                </div>
              </div>
            ))}
            <button className="button secondary" type="button" onClick={addQuestion}>
              <Plus size={18} />
              Adicionar pergunta
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
