import { ClipboardList, MessageSquareText, UsersRound } from "lucide-react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminPage() {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <h1>Seu painel de acompanhamento.</h1>
          <p>
            MVP preparado para cadastrar pacientes, criar formularios com link
            unico e organizar as respostas no historico de cada pessoa.
          </p>
        </div>
        <Link className="button" href="/admin/formularios/novo">
          Criar formulario
        </Link>
      </section>

      <section className={styles.grid}>
        <div className={styles.stat}>
          <UsersRound size={22} />
          <span>Pacientes ativos</span>
          <strong>0</strong>
        </div>
        <div className={styles.stat}>
          <ClipboardList size={22} />
          <span>Formularios ativos</span>
          <strong>2</strong>
        </div>
        <div className={styles.stat}>
          <MessageSquareText size={22} />
          <span>Respostas recebidas</span>
          <strong>0</strong>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Proximas prioridades</h2>
        <div className={styles.list}>
          <div className={styles.item}>
            <div>
              <strong>Cadastrar pacientes manualmente</strong>
              <span>Nome, email, CPF, telefone e status ativo.</span>
            </div>
          </div>
          <div className={styles.item}>
            <div>
              <strong>Historico por paciente</strong>
              <span>Linha do tempo com todas as respostas semanais.</span>
            </div>
          </div>
          <div className={styles.item}>
            <div>
              <strong>Graficos e alertas</strong>
              <span>Peso, adesao, sintomas e respostas criticas.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
