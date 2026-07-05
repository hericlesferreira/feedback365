import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequestAuthorized } from "@/lib/admin-api";
import { hashCpf, isValidCpf, maskCpf, onlyDigits } from "@/lib/cpf";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const createPatientSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "lead"]).default("active")
});

export async function GET(request: Request) {
  if (!(await isAdminRequestAuthorized(request))) {
    return NextResponse.json({ message: "Acesso administrativo invalido." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { message: "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.", patients: [] },
      { status: 200 }
    );
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id,name,email,phone,status,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ patients: data ?? [] });
}

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

  const body = createPatientSchema.parse(await request.json());

  if (!isValidCpf(body.cpf)) {
    return NextResponse.json({ message: "Informe um CPF valido." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      cpf_hash: hashCpf(body.cpf),
      cpf_last4: onlyDigits(body.cpf).slice(-4),
      phone: body.phone?.trim() || null,
      status: body.status
    })
    .select("id,name,email,phone,status,created_at,cpf_last4")
    .single();

  if (error) {
    const duplicated = error.message.toLowerCase().includes("duplicate");
    return NextResponse.json(
      {
        message: duplicated
          ? "Ja existe um paciente cadastrado com esse email e CPF."
          : error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    patient: {
      ...data,
      cpf_display: data?.cpf_last4 ? `***.***.***-${data.cpf_last4}` : maskCpf(body.cpf)
    }
  });
}
