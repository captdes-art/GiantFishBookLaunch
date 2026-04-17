import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase";

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

const LOCAL_PDF_PATH = join(process.cwd(), "arc", "Giant-Fish-and-Happiness-Print.pdf");

async function getArcPdf(): Promise<Buffer | null> {
  // Try Supabase Storage first
  if (hasSupabaseEnv()) {
    const client = getSupabaseAdminClient();
    if (client) {
      const { data, error } = await client.storage.from("arc-pdf").download("current-arc.pdf");
      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    }
  }

  // Fall back to local filesystem
  if (existsSync(LOCAL_PDF_PATH)) {
    return readFileSync(LOCAL_PDF_PATH);
  }

  return null;
}

export async function sendArcEmail(
  to: string,
  name: string,
  customMessage?: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { ok: false, error: "Resend not configured." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "desmond@cqfleet.com";
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  const pdfBuffer = await getArcPdf();
  const attachments: { filename: string; content: Buffer }[] = [];
  if (pdfBuffer) {
    attachments.push({
      filename: "Giant-Fish-and-Happiness-ARC.pdf",
      content: pdfBuffer,
    });
  }

  try {
    const { error } = await client.emails.send({
      from: `Des O'Sullivan <${fromEmail}>`,
      to,
      subject: "Your Advance Copy of Giant Fish & Happiness",
      html: buildArcEmailHtml(name, baseUrl, customMessage),
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

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { ok: false, error: "Resend not configured." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "desmond@cqfleet.com";

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; line-height: 1.7;">
      <h1 style="font-size: 22px; margin-bottom: 20px; color: #1a3a5c;">Confirm your email</h1>
      <p>Hi ${name},</p>
      <p>Thanks for asking to join the Giant Fish &amp; Happiness launch team. To confirm this is really your email and send you the advance copy, please click the link below:</p>
      <p style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background:#1a3a5c;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;">Confirm my email</a>
      </p>
      <p style="color:#555;font-size:14px;">If you didn't sign up, just ignore this email — nothing will happen. The link expires in 24 hours.</p>
      <p style="margin-top:32px;">Thanks,<br/><strong>Des O'Sullivan</strong></p>
    </div>
  `;

  try {
    const { error } = await client.emails.send({
      from: `Des O'Sullivan <${fromEmail}>`,
      to,
      subject: "Confirm your email for Giant Fish & Happiness",
      html,
    });

    if (error) {
      console.error("Verification email send failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Verification email send error:", err);
    return { ok: false, error: "Failed to send verification email." };
  }
}

export async function sendReviewLinkEmail(
  to: string,
  name: string,
  submitUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { ok: false, error: "Resend not configured." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "desmond@cqfleet.com";

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; line-height: 1.7;">
      <h1 style="font-size: 22px; margin-bottom: 20px; color: #1a3a5c;">Submit your review link</h1>
      <p>Hi ${name},</p>
      <p>Thanks again for reading the advance copy. When you're ready to post your honest Amazon review and claim your spot on the Celtic Quest launch party trip, use the personal link below:</p>
      <p style="margin: 28px 0;">
        <a href="${submitUrl}" style="background:#1a3a5c;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;">Submit my review link</a>
      </p>
      <p style="color:#555;font-size:14px;">This link is unique to you — please don't share it.</p>
      <p style="margin-top:32px;">Tight lines,<br/><strong>Des O'Sullivan</strong></p>
    </div>
  `;

  try {
    const { error } = await client.emails.send({
      from: `Des O'Sullivan <${fromEmail}>`,
      to,
      subject: "Your personal review submission link",
      html,
    });
    if (error) {
      console.error("Review link email send failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Review link email send error:", err);
    return { ok: false, error: "Failed to send review link email." };
  }
}

export async function sendCouponEmail(
  to: string,
  firstName: string,
  couponCode: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { ok: false, error: "Resend not configured." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "desmond@cqfleet.com";

  try {
    const { error } = await client.emails.send({
      from: `Des O'Sullivan <${fromEmail}>`,
      replyTo: "captdes@gmail.com",
      to,
      subject: "Your FREE $20 Celtic Quest Fishing Coupon — Thanks for Reading!",
      html: buildCouponEmailHtml(firstName, couponCode),
    });

    if (error) {
      console.error("Coupon email send failed:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("Coupon email send error:", err);
    return { ok: false, error: "Failed to send coupon email." };
  }
}

function buildCouponEmailHtml(firstName: string, couponCode: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; line-height: 1.7;">
      <h1 style="font-size: 24px; margin-bottom: 24px; color: #1a3a5c;">Giant Fish &amp; Happiness</h1>

      <p>Hi ${firstName},</p>

      <p>Thank you so much for reading <strong>Giant Fish &amp; Happiness</strong>. It means the world to me.</p>

      <p>As promised &mdash; here&rsquo;s your FREE $20 Celtic Quest fishing coupon:</p>

      <div style="background: #1a3a5c; color: #ffffff; text-align: center; padding: 24px 20px; border-radius: 12px; margin: 28px 0;">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin-bottom: 8px;">${couponCode}</div>
        <div style="font-size: 16px; color: #daa520; font-weight: bold;">$20 OFF Any Trip</div>
      </div>

      <h2 style="font-size: 18px; margin-top: 32px; color: #1a3a5c;">How to Use It</h2>
      <ol style="padding-left: 20px;">
        <li>Visit <a href="https://www.celticquestfishing.com" style="color: #2563eb;">www.celticquestfishing.com</a></li>
        <li>Book any charter trip</li>
        <li>Enter your coupon code at checkout</li>
      </ol>

      <p>Good on any trip, any date &mdash; no expiration.</p>

      <p>Come fishing with us. The water is beautiful out here.</p>

      <p style="margin-top: 32px;">
        God bless,<br/>
        <strong>Captain Des O&rsquo;Sullivan</strong><br/>
        <span style="color: #666; font-size: 14px;">Celtic Quest Fishing Fleet<br/>Port Jefferson, Long Island<br/>(631) 928-3926<br/><a href="https://www.celticquestfishing.com" style="color: #2563eb;">www.celticquestfishing.com</a></span>
      </p>
    </div>
  `;
}

function buildArcEmailHtml(name: string, baseUrl: string, customMessage?: string): string {
  const customBlock = customMessage
    ? `<p style="background: #f8f5ef; padding: 16px 20px; border-radius: 8px; border-left: 3px solid #daa520; margin: 20px 0;">${customMessage.replace(/\n/g, "<br/>")}</p>`
    : "";

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; line-height: 1.7;">
      <h1 style="font-size: 24px; margin-bottom: 24px; color: #1a3a5c;">Giant Fish &amp; Happiness</h1>

      <p>Hi ${name},</p>

      ${customBlock}

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
