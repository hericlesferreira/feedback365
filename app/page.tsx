import { Suspense } from "react";
import { LoginForm } from "./login-form";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.loginPage}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
