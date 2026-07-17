import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Body {
  perfilId: string;
  rol?: "cliente" | "admin";
  activo?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Falta autenticación" });
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    res.status(401).json({ error: "Sesión inválida" });
    return;
  }

  // Solo un admin puede tocar el perfil de otro usuario.
  const { data: solicitante } = await supabaseAdmin
    .from("perfiles")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  if (solicitante?.rol !== "admin") {
    res.status(403).json({ error: "No tenés permiso para hacer esto" });
    return;
  }

  const body = req.body as Body;
  if (!body?.perfilId) {
    res.status(400).json({ error: "Falta el id del perfil" });
    return;
  }

  const cambios: Record<string, unknown> = {};
  if (body.rol) cambios.rol = body.rol;
  if (typeof body.activo === "boolean") cambios.activo = body.activo;

  if (Object.keys(cambios).length === 0) {
    res.status(400).json({ error: "Nada para actualizar" });
    return;
  }

  const { error } = await supabaseAdmin.from("perfiles").update(cambios).eq("id", body.perfilId);

  if (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "No se pudo actualizar el perfil" });
    return;
  }

  res.status(200).json({ ok: true });
}
