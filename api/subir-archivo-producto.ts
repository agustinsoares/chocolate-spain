import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Body {
    fileBase64: string;
    fileName: string;
    contentType: string;
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

    const { data: perfil } = await supabaseAdmin
        .from("perfiles")
        .select("rol")
        .eq("id", userData.user.id)
        .single();

    if (perfil?.rol !== "admin") {
        res.status(403).json({ error: "No tenés permiso para hacer esto" });
        return;
    }

    const body = req.body as Body;
    if (!body?.fileBase64 || !body?.fileName) {
        res.status(400).json({ error: "Falta el archivo" });
        return;
    }

    const buffer = Buffer.from(body.fileBase64, "base64");

    const { error: uploadError } = await supabaseAdmin.storage
        .from("productos")
        .upload(body.fileName, buffer, {
            contentType: body.contentType,
            upsert: true,
        });

    if (uploadError) {
        console.error("Error subiendo archivo:", uploadError);
        res.status(500).json({ error: "No se pudo subir el archivo" });
        return;
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("productos").getPublicUrl(body.fileName);

    res.status(200).json({ url: publicUrlData.publicUrl });
}