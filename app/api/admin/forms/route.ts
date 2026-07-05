import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const questionSchema = z.object({
  label: z.string().min(2),
  type: z.enum([
    "short_text",
    "long_text",
    "number",
    "date",
    "yes_no",
    "single_choice",
    "multiple_choice",
    "scale",
    "weight"
  ]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  helperText: z.string().optional()
});

const createFormSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  type: z.enum(["public", "patient_linked"]),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1)
});

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized(request))) {
    return NextResponse.json({ message: "Acesso administrativo invalido." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { message: "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 }
    );
  }

  const body = createFormSchema.parse(await request.json());
  const slug = slugify(body.slug || body.title);

  const { data: form, error: formError } = await supabase
    .from("forms")
    .insert({
      title: body.title,
      slug,
      type: body.type,
      description: body.description || null,
      is_active: true
    })
    .select("id,slug")
    .single<{ id: string; slug: string }>();

  if (formError || !form) {
    return NextResponse.json(
      { message: formError?.message ?? "Nao foi possivel criar o formulario." },
      { status: 500 }
    );
  }

  const { error: questionsError } = await supabase.from("form_questions").insert(
    body.questions.map((question, index) => ({
      form_id: form.id,
      label: question.label,
      type: question.type,
      required: question.required,
      helper_text: question.helperText || null,
      options: question.options?.filter(Boolean) ?? null,
      order_index: index + 1
    }))
  );

  if (questionsError) {
    return NextResponse.json({ message: questionsError.message }, { status: 500 });
  }

  return NextResponse.json({ id: form.id, slug: form.slug });
}
