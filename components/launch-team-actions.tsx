"use client";

import { useState } from "react";
import type { LaunchTeamMember } from "@/lib/types";

export function LaunchTeamActions({ members }: { members: LaunchTeamMember[] }) {
  const [copied, setCopied] = useState(false);

  const emails = members
    .map((m) => m.email)
    .filter((e): e is string => Boolean(e));

  function handleCopyEmails() {
    if (!emails.length) return;
    navigator.clipboard.writeText(emails.join(", ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleExportCsv() {
    const headers = ["Name", "Email", "Phone", "Category", "Source", "Status", "Agreed", "ARC Sent", "Review Posted", "Review Link", "Launch Party Confirmed", "Notes"];
    const rows = members.map((m) => [
      m.full_name,
      m.email ?? "",
      m.phone ?? "",
      m.category,
      m.source ?? "",
      m.status,
      m.agreed_to_read_review ? "Yes" : "No",
      m.arc_sent ? "Yes" : "No",
      m.review_posted ? "Yes" : "No",
      m.review_link ?? "",
      m.launch_party_confirmed ? "Yes" : "No",
      m.notes ?? "",
    ]);

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "launch-team.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button className="ghost-button" onClick={handleCopyEmails} disabled={!emails.length}>
        {copied ? "Copied!" : `Copy ${emails.length} email${emails.length !== 1 ? "s" : ""}`}
      </button>
      <button className="ghost-button" onClick={handleExportCsv} disabled={!members.length}>
        Export CSV
      </button>
    </div>
  );
}
