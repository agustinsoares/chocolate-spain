import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Body {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  email?: string;
  password?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const body = req.body as Body;
  const nombre = body?.nombre?.trim() ?? "";
  const apellidos = body?.apellidos?.trim() ?? "";
  const telefono = body?.telefono?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (!nombre || !apellidos || !telefono || !email || !password) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Crea el usuario ya confirmado (sin validación por correo) y sin rol admin.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, apellidos, telefono },
  });

  if (error || !data.user) {
    const mensaje = error?.message?.toLowerCase().includes("already")
      ? "Ya existe una cuenta con ese email"
      : error?.message ?? "No se pudo crear la cuenta";
    res.status(400).json({ error: mensaje });
    return;
  }

  // Garantiza perfil activo como cliente. El rol admin se asigna después a mano.
  const { error: perfilError } = await supabaseAdmin.from("perfiles").upsert(
    {
      id: data.user.id,
      email,
      nombre,
      apellidos,
      telefono,
      rol: "cliente",
      activo: true,
    },
    { onConflict: "id" }
  );

  if (perfilError) {
    console.error("Error creando perfil:", perfilError);
    // El usuario Auth ya existe; intentamos limpiar para no dejar cuentas huérfanas.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    res.status(500).json({ error: "No se pudo crear el perfil del usuario" });
    return;
  }

  res.status(200).json({ ok: true });
}
