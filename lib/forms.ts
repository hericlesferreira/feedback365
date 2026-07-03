import { randomUUID } from "node:crypto";
import { getDemoFormBySlug } from "./mock-data";
import { getSupabaseAdmin } from "./supabase/server";
import type { FormAnswers, PatientForm } from "./types";

type DbQuestion = {
  id: string;
  label: string;
  type: PatientForm["questions"][number]["type"];
  required: boolean;
  options: string[] | null;
  helper_text: string | null;
  order_index: number;
};

type DbForm = {
  id: string;
  title: string;
  slug: string;
  type: PatientForm["type"];
  description: string | null;
  is_active: boolean;
  form_questions: DbQuestion[];
};

export async function getFormBySlug(slug: string): Promise<PatientForm | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return getDemoFormBySlug(slug);
  }

  const { data, error } = await supabase
    .from("forms")
    .select(
      "id,title,slug,type,description,is_active,form_questions(id,label,type,required,options,helper_text,order_index)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single<DbForm>();

  if (error || !data) {
    return getDemoFormBySlug(slug);
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    type: data.type,
    description: data.description ?? undefined,
    isActive: data.is_active,
    questions: [...data.form_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((question) => ({
        id: question.id,
        label: question.label,
        type: question.type,
        required: question.required,
        options: question.options ?? undefined,
        helperText: question.helper_text ?? undefined,
        orderIndex: question.order_index
      }))
  };
}

export async function saveFormResponse(input: {
  formId: string;
  patientId?: string | null;
  respondentEmail?: string | null;
  answers: FormAnswers;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { id: randomUUID() };
  }

  const { data, error } = await supabase
    .from("form_responses")
    .insert({
      form_id: input.formId,
      patient_id: input.patientId ?? null,
      respondent_email: input.respondentEmail ?? null,
      answers: input.answers
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
