import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faroty - Gestion de Paiement",
  description: "Plateforme de gestion des paiements et des comptes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
