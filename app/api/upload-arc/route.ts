import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase";

export async function POST() {
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
