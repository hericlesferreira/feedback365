import { hashCpf } from "./cpf";
import { getSupabaseAdmin } from "./supabase/server";

export async function findPatientByEmailAndCpf(input: { email: string; cpf: string }) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    if (
      input.email.trim().toLowerCase() === "paciente@exemplo.com" &&
      input.cpf.replace(/\D/g, "") === "12345678909"
    ) {
      return {
        id: "demo-patient",
        name: "Paciente Exemplo",
        email: "paciente@exemplo.com"
      };
    }

    return null;
  }

  const cpfHash = hashCpf(input.cpf);

  const { data, error } = await supabase
    .from("patients")
    .select("id,name,email")
    .eq("email", input.email.trim().toLowerCase())
    .eq("cpf_hash", cpfHash)
    .eq("status", "active")
    .single<{ id: string; name: string; email: string }>();

  if (error || !data) {
    return null;
  }

  return data;
}
