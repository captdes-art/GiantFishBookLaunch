import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

export function hasResendEnv() {
  return Boolean(process.env.RESEND_API_KEY);
}

const ARC_PDF_PATH = join(process.cwd(), "arc", "giant-fish-arc.pdf");

export async function sendArcEmail(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { ok: false, error: "Resend not configured." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "des@celticquestcharters.com";
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  const attachments: { filename: string; content: Buffer }[] = [];
  if (existsSync(ARC_PDF_PATH)) {
    attachments.push({
      filename: "Giant-Fish-and-Happiness-ARC.pdf",
      content: readFileSync(ARC_PDF_PATH),
    });
  }

  try {
    const { error } = await client.emails.send({
      from: `Des O'Sullivan <${fromEmail}>`,
      to,
      subject: "Your Advance Copy of Giant Fish & Happiness",
      html: buildArcEmailHtml(name, baseUrl),
      attachments,
    });

    if (error) {
      console.error("Resend send failed:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("Resend send error:", err);
    return { ok: false, error: "Failed to send email." };
  }
}

function buildArcEmailHtml(name: string, baseUrl: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; line-height: 1.7;">
      <h1 style="font-size: 24px; margin-bottom: 24px; color: #1a3a5c;">Giant Fish &amp; Happiness</h1>

      <p>Hi ${name},</p>

      <p>Thank you so much for joining the launch team. Your support means everything to me.</p>

      <p>Attached to this email is your advance copy of <strong>Giant Fish &amp; Happiness</strong>. I truly hope you enjoy reading it.</p>

      <p>We plan on launching on <strong>May 26th, 2026</strong>, and it would mean the world to me if you could read it and, when we launch, take a few minutes to post an honest review for me on Amazon. Even just a couple of sentences would help spread the word more than you know.</p>

      <p>To say thanks — not only do you get this free advance copy, but <strong>I'll be hosting a launch party on the Celtic Quest over the summer</strong>. A free trip on me to come hang out, do some fishing together, and have a great time. All you need to do is post your review and submit the link so I know you did it.</p>

      <h2 style="font-size: 18px; margin-top: 32px; color: #1a3a5c;">What to Do</h2>
      <ol style="padding-left: 20px;">
        <li>Read the book (attached PDF)</li>
        <li>When we launch on May 26th, post an honest review on Amazon</li>
        <li><a href="${baseUrl}/submit-review" style="color: #2563eb;">Submit your review link here</a> to confirm your spot on the launch party trip</li>
      </ol>

      <p>That's it. Simple as that.</p>

      <p>Thank you again — I'm genuinely grateful to have you on this team.</p>

      <p style="margin-top: 32px;">
        Tight lines,<br/>
        <strong>Des O'Sullivan</strong><br/>
        <span style="color: #666; font-size: 14px;">Captain, Celtic Quest Fishing Fleet<br/>Port Jefferson, Long Island, NY</span>
      </p>
    </div>
  `;
}
