"use client";

import { useState } from "react";

export function ArcPdfUpload() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("pdf") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setStatus({ ok: false, message: "Please select a PDF file." });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      // Get signed upload URL from our API (small request, no file)
      const res = await fetch("/api/upload-arc", { method: "POST" });
      const { ok, signedUrl, message } = await res.json();

      if (!ok || !signedUrl) {
        setStatus({ ok: false, message: message || "Failed to get upload URL." });
        return;
      }

      // Upload directly to Supabase Storage (bypasses Vercel body limit)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });

      if (!uploadRes.ok) {
        setStatus({ ok: false, message: "Upload to storage failed." });
        return;
      }

      setStatus({ ok: true, message: `PDF uploaded successfully (${(file.size / 1024 / 1024).toFixed(1)} MB).` });
    } catch {
      setStatus({ ok: false, message: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="form-grid">
      <div className="field">
        <label htmlFor="arc-pdf">Upload new ARC PDF</label>
        <input id="arc-pdf" name="pdf" type="file" accept=".pdf" required />
      </div>
      <div className="actions">
        <button className="button" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        {status && (
          <span className="small" style={{ color: status.ok ? "var(--success)" : "var(--danger)" }}>
            {status.message}
          </span>
        )}
      </div>
    </form>
  );
}
