import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeepleAI — L'Arbitro e Compagno dei Giochi da Tavolo (Powered by Gemini)",
  description: "Risolvi dubbi sulle regole, scopri nuovi giochi da tavolo e prepara il tavolo in fretta con l'IA di Google Gemini.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎲</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body className="bg-[#0f1117] text-slate-100 antialiased h-screen overflow-hidden select-text">
        {children}
      </body>
    </html>
  );
}
