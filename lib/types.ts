export type FormType = "public" | "patient_linked";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "number"
  | "date"
  | "yes_no"
  | "single_choice"
  | "multiple_choice"
  | "scale"
  | "weight";

export type FormQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  helperText?: string;
  orderIndex: number;
};

export type PatientForm = {
  id: string;
  title: string;
  slug: string;
  type: FormType;
  description?: string;
  isActive: boolean;
  questions: FormQuestion[];
};

export type PatientIdentity = {
  email: string;
  cpf: string;
};

export type FormAnswerValue = string | number | boolean | string[] | null;

export type FormAnswers = Record<string, FormAnswerValue>;

export type Patient = {
  id: string;
  name: string;
  email: string;
  cpfHash: string;
  phone?: string;
  status: "active" | "inactive" | "lead";
  createdAt: string;
};

export type FormResponse = {
  id: string;
  formId: string;
  patientId?: string | null;
  respondentEmail?: string | null;
  answers: FormAnswers;
  createdAt: string;
};
