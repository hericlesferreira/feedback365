import { notFound } from "next/navigation";
import { getFormBySlug } from "@/lib/forms";
import { PatientFormFlow } from "./patient-form-flow";
import styles from "./patient-form.module.css";

export default async function FormPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

  if (!form) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <PatientFormFlow form={form} />
    </div>
  );
}
