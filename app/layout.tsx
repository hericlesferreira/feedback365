import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feedback365",
  description: "Acompanhamento inteligente para pacientes de consultorio"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
