alter table public.patients
add column if not exists cpf_last4 text;
