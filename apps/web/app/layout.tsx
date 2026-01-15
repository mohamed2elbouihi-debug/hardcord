import "../styles/globals.css";
import type { Metadata } from "next";
import { AppProviders } from "../components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Hardcord",
  description: "Discord-like experience"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className="dark">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
