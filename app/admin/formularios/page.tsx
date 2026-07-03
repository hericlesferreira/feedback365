import { demoForms } from "@/lib/mock-data";
import Link from "next/link";
import styles from "../admin.module.css";

export default function FormsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <h1>Formularios</h1>
          <p>
            Cada formulario tem um link unico compartilhavel. Os vinculados
            exigem email + CPF para salvar no historico do paciente.
          </p>
        </div>
        <Link className="button" href="/admin/formularios/novo">
          Novo formulario
        </Link>
      </section>

      <section className={styles.panel}>
        <h2>Modelos iniciais</h2>
        <div className={styles.list}>
          {demoForms.map((form) => (
            <div className={styles.item} key={form.id}>
              <div>
                <strong>{form.title}</strong>
                <span>
                  /f/{form.slug} · {form.type === "public" ? "publico" : "vinculado ao paciente"}
                </span>
              </div>
              <Link className="button secondary" href={`/f/${form.slug}`}>
                Abrir
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
