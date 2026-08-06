import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Body {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: "Falta autenticación" });
    return;
  }

  const body = req.body as Body;
  const nombre = body?.nombre?.trim() ?? "";
  const apellidos = body?.apellidos?.trim() ?? "";
  const telefono = body?.telefono?.trim() ?? "";

  if (!nombre || !apellidos || telefono.length < 6) {
    res.status(400).json({ error: "Revisá los datos ingresados" });
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    res.status(401).json({ error: "Sesión inválida" });
    return;
  }

  const { error } = await supabaseAdmin
    .from("perfiles")
    .update({ nombre, apellidos, telefono })
    .eq("id", userData.user.id);

  if (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "No se pudieron guardar los cambios" });
    return;
  }

  await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
    user_metadata: { nombre, apellidos, telefono },
  });

  res.status(200).json({ ok: true });
}
