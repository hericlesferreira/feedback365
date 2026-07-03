import { ClipboardList, LineChart, UsersRound } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Feedback365</p>
          <h1>Acompanhamento nutricional com check-ins simples e historico claro.</h1>
          <p className={styles.copy}>
            Crie formularios, envie um unico link para seus pacientes e acompanhe
            cada resposta no historico correto, sem exigir cadastro do paciente.
          </p>
          <div className={styles.actions}>
            <Link className="button" href="/admin">
              Acessar painel
            </Link>
            <Link className="button secondary" href="/f/checkin-semanal">
              Ver formulario exemplo
            </Link>
          </div>
        </div>
        <div className={styles.preview} aria-label="Resumo da plataforma">
          <div className={styles.previewHeader}>
            <span>Hoje</span>
            <strong>12 respostas</strong>
          </div>
          <div className={styles.metric}>
            <UsersRound size={20} />
            <div>
              <strong>Pacientes ativos</strong>
              <span>Identificacao por email + CPF</span>
            </div>
          </div>
          <div className={styles.metric}>
            <ClipboardList size={20} />
            <div>
              <strong>Formularios</strong>
              <span>Publicos ou vinculados ao paciente</span>
            </div>
          </div>
          <div className={styles.metric}>
            <LineChart size={20} />
            <div>
              <strong>Historico</strong>
              <span>Respostas organizadas por paciente</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
