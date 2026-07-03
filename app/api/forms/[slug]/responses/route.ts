import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidCpf } from "@/lib/cpf";
import { getFormBySlug, saveFormResponse } from "@/lib/forms";
import { findPatientByEmailAndCpf } from "@/lib/patients";

const submitSchema = z.object({
  identity: z
    .object({
      email: z.string().email(),
      cpf: z.string().min(11)
    })
    .optional(),
  answers: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]))
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = submitSchema.parse(await request.json());
    const form = await getFormBySlug(slug);

    if (!form) {
      return NextResponse.json({ message: "Formulario nao encontrado." }, { status: 404 });
    }

    let patientId: string | null = null;
    let respondentEmail: string | null = body.identity?.email ?? null;

    if (form.type === "patient_linked") {
      if (!body.identity?.email || !body.identity?.cpf || !isValidCpf(body.identity.cpf)) {
        return NextResponse.json(
          { message: "Informe email e CPF validos para continuar." },
          { status: 400 }
        );
      }

      const patient = await findPatientByEmailAndCpf(body.identity);

      if (!patient) {
        return NextResponse.json(
          { message: "Nao encontramos um paciente ativo com esse email e CPF." },
          { status: 403 }
        );
      }

      patientId = patient.id;
      respondentEmail = patient.email;
    }

    const missingRequired = form.questions.find((question) => {
      if (!question.required) return false;
      const value = body.answers[question.id];
      return value === undefined || value === null || value === "" || Array.isArray(value) && value.length === 0;
    });

    if (missingRequired) {
      return NextResponse.json(
        { message: `Responda a pergunta obrigatoria: ${missingRequired.label}` },
        { status: 400 }
      );
    }

    const response = await saveFormResponse({
      formId: form.id,
      patientId,
      respondentEmail,
      answers: body.answers
    });

    return NextResponse.json({ id: response.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
