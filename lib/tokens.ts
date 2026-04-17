import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";

// Random opaque token for one-time email verification links.
// 48 hex chars = 24 bytes of entropy = infeasible to guess.
export function generateVerificationToken(): string {
  return randomBytes(24).toString("hex");
}

// HMAC-signed token that binds a member id to a signature. Used by
// /submit-review — the admin (or the /join-launch-team verify flow)
// emails the member a link containing this token; the backend verifies
// it before allowing the review-link update. Stops strangers from
// updating other members' rows by guessing emails (rule #6).
//
// Format: <memberId>.<base64url(hmac)>

function getSecret(): string {
  const secret = process.env.TOKEN_SIGNING_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "TOKEN_SIGNING_SECRET is not set or is too short (need >= 32 chars)"
    );
  }
  return secret;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function signMemberToken(memberId: string): string {
  const sig = createHmac("sha256", getSecret()).update(memberId).digest();
  return `${memberId}.${base64url(sig)}`;
}

export function verifyMemberToken(token: string): string | null {
  if (!token || typeof token !== "string") return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;

  const memberId = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);

  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(
      sigPart.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (sigPart.length % 4)) % 4),
      "base64"
    );
  } catch {
    return null;
  }

  let expectedSig: Buffer;
  try {
    expectedSig = createHmac("sha256", getSecret()).update(memberId).digest();
  } catch {
    return null;
  }

  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedSig, expectedSig)) return null;
  return memberId;
}
