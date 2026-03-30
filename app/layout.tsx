import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Giant Fish & Happiness Command Center",
  description: "Internal operational dashboard for the Giant Fish & Happiness book launch."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
