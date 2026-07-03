import Link from "next/link";
import styles from "./admin.module.css";
import { LogoutButton } from "./logout-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/admin">
          <strong>Feedback365</strong>
          <span>Painel do profissional</span>
        </Link>
        <div className={styles.links}>
          <Link className="button secondary" href="/admin/formularios">
            Formularios
          </Link>
          <Link className="button secondary" href="/admin/formularios/novo">
            Novo formulario
          </Link>
          <Link className="button secondary" href="/f/checkin-semanal">
            Exemplo paciente
          </Link>
          <LogoutButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
