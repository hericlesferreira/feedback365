import type { PatientForm } from "./types";

export const demoForms: PatientForm[] = [
  {
    id: "demo-checkin",
    title: "Check-in semanal",
    slug: "checkin-semanal",
    type: "patient_linked",
    description:
      "Algumas perguntas rapidas para eu entender sua semana e ajustar sua estrategia com mais clareza.",
    isActive: true,
    questions: [
      {
        id: "peso_atual",
        label: "Qual foi seu peso mais recente?",
        type: "weight",
        required: true,
        helperText: "Use a mesma balanca e horario sempre que possivel.",
        orderIndex: 1
      },
      {
        id: "adesao",
        label: "De 0 a 10, como foi sua adesao ao plano alimentar?",
        type: "scale",
        required: true,
        orderIndex: 2
      },
      {
        id: "fome",
        label: "Sua fome ficou controlada na maior parte da semana?",
        type: "yes_no",
        required: true,
        orderIndex: 3
      },
      {
        id: "dificuldades",
        label: "Qual foi a maior dificuldade da semana?",
        type: "long_text",
        required: false,
        orderIndex: 4
      },
      {
        id: "intestino",
        label: "Como esteve seu intestino?",
        type: "single_choice",
        required: true,
        options: ["Regular", "Preso", "Solto", "Oscilando"],
        orderIndex: 5
      },
      {
        id: "observacoes",
        label: "Tem algo importante que eu preciso saber antes do proximo ajuste?",
        type: "long_text",
        required: false,
        orderIndex: 6
      }
    ]
  },
  {
    id: "demo-anamnese",
    title: "Anamnese pre-consulta",
    slug: "anamnese-inicial",
    type: "public",
    description:
      "Formulario inicial para conhecer historico, rotina, objetivos e pontos de atencao.",
    isActive: true,
    questions: [
      {
        id: "nome",
        label: "Qual e seu nome completo?",
        type: "short_text",
        required: true,
        orderIndex: 1
      },
      {
        id: "objetivo",
        label: "Qual e seu principal objetivo com o acompanhamento?",
        type: "long_text",
        required: true,
        orderIndex: 2
      },
      {
        id: "restricoes",
        label: "Voce possui restricoes alimentares, alergias ou diagnosticos importantes?",
        type: "long_text",
        required: false,
        orderIndex: 3
      }
    ]
  }
];

export function getDemoFormBySlug(slug: string) {
  return demoForms.find((form) => form.slug === slug && form.isActive) ?? null;
}
