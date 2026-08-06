import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
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

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    res.status(401).json({ error: "Sesión inválida" });
    return;
  }

  const userId = userData.user.id;

  const [{ data: pedidos, error: pedidosError }, { data: estadosPedido }, { data: estadosPago }] =
    await Promise.all([
      supabaseAdmin
        .from("pedidos")
        .select("*")
        .eq("perfil_id", userId)
        .order("creado_en", { ascending: false }),
      supabaseAdmin.from("estados_pedido").select("*").order("id"),
      supabaseAdmin.from("estados_pago").select("*").order("id"),
    ]);

  if (pedidosError) {
    console.error("Error cargando pedidos:", pedidosError);
    res.status(500).json({ error: "No se pudieron cargar tus pedidos" });
    return;
  }

  const lista = pedidos ?? [];
  const ids = lista.map((p) => p.id);

  let detalles: Array<{
    id: number;
    pedido_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    notas: string | null;
  }> = [];

  if (ids.length > 0) {
    const { data: detalleData, error: detalleError } = await supabaseAdmin
      .from("detalle_pedido")
      .select("id, pedido_id, producto_nombre, cantidad, precio_unitario, notas")
      .in("pedido_id", ids);

    if (detalleError) {
      console.error("Error cargando detalle:", detalleError);
      res.status(500).json({ error: "No se pudo cargar el detalle de los pedidos" });
      return;
    }

    detalles = detalleData ?? [];
  }

  const nombreEstadoPedido = (id: number) =>
    estadosPedido?.find((e) => e.id === id)?.nombre ?? "—";
  const nombreEstadoPago = (id: number) =>
    estadosPago?.find((e) => e.id === id)?.nombre ?? "—";

  const resultado = lista.map((pedido) => ({
    ...pedido,
    estado_pedido: nombreEstadoPedido(pedido.estado_pedido_id),
    estado_pago: nombreEstadoPago(pedido.estado_pago_id),
    items: detalles.filter((d) => d.pedido_id === pedido.id),
  }));

  res.status(200).json({ pedidos: resultado });
}
