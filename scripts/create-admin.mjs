#!/usr/bin/env node
// One-shot script: create the admin auth user and seed user_roles.
// Idempotent — safe to re-run.
//
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envFile = process.argv[2] || ".env.production";
const raw = readFileSync(envFile, "utf8");
for (const line of raw.split("\n")) {
  const m = line.match(/^([A-Z_]+)="?(.*?)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const ADMIN_EMAIL = process.argv[3] || "captdes@gmail.com";
const ADMIN_PASSWORD = process.argv[4] || "CQfun48@";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let userId = null;

  // 1. Try to find existing user
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (found) {
      userId = found.id;
      console.log(`Found existing user: ${userId}`);
      // Reset password to the requested value so we know the credential.
      const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (updateErr) throw updateErr;
      console.log("Password reset + email confirmed.");
      break;
    }
    if (data.users.length < 200) break;
    page++;
  }

  // 2. Create if not found
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created admin user: ${userId}`);
  }

  // 3. Upsert into user_roles
  const { error: roleErr } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });
  if (roleErr) throw roleErr;
  console.log(`Seeded user_roles row: admin for ${ADMIN_EMAIL}`);

  // 4. Verify via has_role (service role bypasses RLS; use anon-style check)
  const { data: roleRow, error: readErr } = await admin
    .from("user_roles")
    .select("user_id, role")
    .eq("user_id", userId)
    .single();
  if (readErr) throw readErr;
  console.log("Verification:", roleRow);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
