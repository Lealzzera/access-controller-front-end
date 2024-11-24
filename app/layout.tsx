import type { Metadata } from "next";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "Controlador de acessos",
  description: "Controlador de acessos para escolas do ensino infantil.",
};

const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--main-font-sans",
  weight: ["400", "700"],
});

const ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--main-font-mono",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${ibm_plex_sans.variable} ${ibm_plex_mono.variable}`}
    >
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
