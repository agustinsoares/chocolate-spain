import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

/**
 * Env necesarios:
 * - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * - RESEND_API_KEY
 * - RESEND_FROM  (ej. "Chocolate <hola@tudominio.com>") — requiere dominio verificado en Resend.
 *               Fallback: "Chocolate Spain <onboarding@resend.dev>" (solo pruebas).
 * - SITE_URL     (ej. https://tudominio.com o http://localhost:8080)
 *
 * En Supabase Dashboard → Authentication → URL Configuration, agregá a Redirect URLs:
 *   {SITE_URL}/nueva-contrasena
 */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;
const resendFrom =
  process.env.RESEND_FROM ?? "Chocolate Spain <onboarding@resend.dev>";
const siteUrl = (process.env.SITE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const resend = new Resend(resendApiKey);

interface Body {
  email?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const body = req.body as Body;
  const email = body?.email?.trim().toLowerCase() ?? "";

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Email inválido" });
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const redirectTo = `${siteUrl}/nueva-contrasena`;

  // Si el usuario no existe, generateLink falla — igual respondemos ok (anti-enumeration).
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    console.warn("Recuperación (sin link):", error?.message ?? "sin action_link");
    res.status(200).json({ ok: true });
    return;
  }

  const link = data.properties.action_link;

  try {
    const { error: emailError } = await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: "Recuperá tu contraseña — Chocolate",
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; color: #2b1c14; max-width: 480px; margin: 0 auto;">
          <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a7a6b;">Chocolate</p>
          <h1 style="font-size: 28px; font-weight: 500; margin: 8px 0 16px;">Recuperá tu contraseña</h1>
          <p style="font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.5; color: #5c4f45;">
            Recibimos un pedido para restablecer la contraseña de tu cuenta.
            Tocá el botón para elegir una nueva. El enlace vence en poco tiempo.
          </p>
          <p style="margin: 28px 0;">
            <a href="${link}"
               style="display: inline-block; background: #3d2a1f; color: #f7f3ee; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-family: system-ui, sans-serif; font-size: 14px;">
              Elegir nueva contraseña
            </a>
          </p>
          <p style="font-family: system-ui, sans-serif; font-size: 13px; color: #8a7a6b; line-height: 1.5;">
            Si no pediste este cambio, ignorá este correo. Tu cuenta sigue segura.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error Resend recuperación:", emailError);
      res.status(500).json({ error: "No se pudo enviar el correo. Probá de nuevo en un momento." });
      return;
    }
  } catch (err) {
    console.error("Error enviando recuperación:", err);
    res.status(500).json({ error: "No se pudo enviar el correo. Probá de nuevo en un momento." });
    return;
  }

  res.status(200).json({ ok: true });
}
