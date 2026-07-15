"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const publicRoutes = ["/proof-of-purchase", "/join-launch-team", "/submit-review", "/confirm-launch-party", "/claim", "/rsvp", "/signed-copy"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return <main className="main">{children}</main>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Giant Fish & Happiness</h1>
          <p>Internal launch command center for the May 4, 2026 release.</p>
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
          <Link href="/rsvp">Public RSVP form</Link>
          <Link href="/proof-of-purchase">Public proof-of-purchase form</Link>
          <Link href="/join-launch-team">Public ARC signup form</Link>
          <Link href="/confirm-launch-party">Launch party confirmation link</Link>
          <Link href="/submit-review">Public review submission</Link>
          <Link href="/claim">Public coupon claim form</Link>
        </nav>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
