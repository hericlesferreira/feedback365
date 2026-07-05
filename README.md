# Feedback365

Plataforma de formularios para acompanhamento de pacientes de consultorio de nutricao.

## Stack

- Next.js na Vercel
- Supabase Postgres no plano gratuito
- Links compartilhaveis por formulario
- Paciente responde sem criar conta, usando email + CPF para formularios vinculados

## MVP implementado

- Tela do paciente com uma pergunta por etapa e barra de progresso
- Formulario publico e formulario vinculado ao paciente
- Validacao por email + CPF no servidor
- CPF salvo/consultado por hash HMAC, nao como texto puro
- Construtor inicial de formularios no painel admin
- SQL inicial para Supabase em `supabase/schema.sql`

## Configuracao

1. Crie um projeto no Supabase.
2. Rode o SQL de `supabase/schema.sql` no SQL Editor.
3. Configure as variaveis na Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CPF_HASH_SECRET=
ADMIN_ACCESS_TOKEN=
```

`CPF_HASH_SECRET` deve ser uma frase longa e secreta. Guarde, porque trocar essa chave impede comparar CPFs ja cadastrados.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Sem variaveis de ambiente, a aplicacao usa formularios de demonstracao:

- `/f/checkin-semanal`
- `/f/anamnese-inicial`

Para testar o check-in vinculado sem Supabase:

```text
Email: paciente@exemplo.com
CPF: 123.456.789-09
```

## Atualizacoes de banco

Se voce ja rodou o schema antes da tela de pacientes, rode tambem:

```sql
alter table public.patients
add column if not exists cpf_last4 text;
```

## Observacao LGPD

CPF e respostas de saude/nutricao sao dados pessoais sensiveis. O projeto evita expor CPF puro na base, mas ainda precisa de politica de privacidade, controle de acesso administrativo, revisao de consentimento e rotinas de retencao/exclusao antes de uso em producao.
