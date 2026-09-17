import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NUMBER OVER",
    template: "%s · NUMBER OVER",
  },
  description: "NUMBER OVER — Plateforme de numéros virtuels. En construction.",
  robots: { index: false, follow: false }, // Retiré au lancement (phase 16)
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
