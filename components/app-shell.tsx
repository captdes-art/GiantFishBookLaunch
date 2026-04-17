"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const publicRoutes = ["/proof-of-purchase", "/join-launch-team", "/submit-review", "/claim", "/login"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return <main className="main">{children}</main>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Giant Fish & Happiness</h1>
          <p>Internal launch command center for the Memorial Day 2026 release window.</p>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link key={item.href} href={item.href} className={cn(active && "active")}>
                {item.label}
              </Link>
            );
          })}
          <Link href="/proof-of-purchase">Public proof-of-purchase form</Link>
          <Link href="/join-launch-team">Public ARC signup form</Link>
          <Link href="/submit-review">Public review submission</Link>
          <Link href="/claim">Public coupon claim form</Link>
        </nav>

        <form action={signOut} style={{ marginTop: "auto", padding: "16px 0" }}>
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              width: "100%",
            }}
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
