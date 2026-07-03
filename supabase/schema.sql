create extension if not exists "pgcrypto";

create type form_type as enum ('public', 'patient_linked');
create type patient_status as enum ('lead', 'active', 'inactive');
create type question_type as enum (
  'short_text',
  'long_text',
  'number',
  'date',
  'yes_no',
  'single_choice',
  'multiple_choice',
  'scale',
  'weight'
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  cpf_hash text not null,
  phone text,
  status patient_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index patients_email_cpf_hash_idx on public.patients (lower(email), cpf_hash);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type form_type not null default 'patient_linked',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  label text not null,
  type question_type not null,
  required boolean not null default true,
  options jsonb,
  helper_text text,
  order_index integer not null default 1,
  created_at timestamptz not null default now()
);

create index form_questions_form_order_idx on public.form_questions (form_id, order_index);

create table public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  respondent_email text,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index form_responses_form_created_idx on public.form_responses (form_id, created_at desc);
create index form_responses_patient_created_idx on public.form_responses (patient_id, created_at desc);

alter table public.patients enable row level security;
alter table public.forms enable row level security;
alter table public.form_questions enable row level security;
alter table public.form_responses enable row level security;

-- The app writes through Vercel API routes with SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose service role keys in the browser.
