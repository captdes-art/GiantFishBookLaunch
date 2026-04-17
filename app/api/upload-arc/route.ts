import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export async function POST() {
  // Security rule #12: upload endpoints self-gate. Don't trust middleware
  // alone for /api/upload*. First line of the handler is the admin check.
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: false, message: "Supabase not configured." }, { status: 500 });
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return NextResponse.json({ ok: false, message: "Database unavailable." }, { status: 500 });
  }

  const { data, error } = await client.storage.from("arc-pdf").createSignedUploadUrl("current-arc.pdf", {
    upsert: true,
  });

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message || "Failed to create upload URL." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, signedUrl: data.signedUrl, token: data.token });
}
