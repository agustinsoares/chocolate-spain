import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ItemInput {
  productoId: number;
  cantidad: number;
}

interface CrearPedidoManualBody {
  items: ItemInput[];
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  metodoEntrega: "retiro" | "domicilio";
  direccionEntrega?: string;
  poblacionEntrega?: string;
  provinciaEntrega?: string;
  codigoPostalEntrega?: string;
  fechaEntrega: string;
  notas?: string;
  estadoPedidoNombre?: string; // default: "Confirmado"
  estadoPagoNombre?: string; // default: "Pagado"
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

  // Solo un admin puede cargar pedidos manuales.
  const { data: perfilSolicitante } = await supabaseAdmin
    .from("perfiles")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  if (perfilSolicitante?.rol !== "admin") {
    res.status(403).json({ error: "No tenés permiso para hacer esto" });
    return;
  }

  const body = req.body as CrearPedidoManualBody;

  if (!body?.items?.length) {
    res.status(400).json({ error: "Agregá al menos un producto" });
    return;
  }

  if (!body.nombre || !body.apellidos || !body.telefono || !body.email) {
    res.status(400).json({ error: "Faltan datos de contacto del cliente" });
    return;
  }

  if (
    body.metodoEntrega === "domicilio" &&
    (!body.direccionEntrega ||
      !body.poblacionEntrega ||
      !body.provinciaEntrega ||
      !body.codigoPostalEntrega)
  ) {
    res.status(400).json({ error: "Falta la dirección de envío" });
    return;
  }

  // Precios reales desde la base — a propósito NO validamos ni tocamos
  // cupo_disponible acá: son ventas ya resueltas por fuera (Instagram,
  // WhatsApp), no deben verse afectadas por el cupo online.
  const productoIds = body.items.map((i) => i.productoId);
  const { data: productos, error: productosError } = await supabaseAdmin
    .from("productos")
    .select("id, nombre, precio")
    .in("id", productoIds);

  if (productosError || !productos) {
    res.status(500).json({ error: "No se pudieron validar los productos" });
    return;
  }

  const detalle: {
    producto_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
  }[] = [];
  let total = 0;

  for (const item of body.items) {
    const producto = productos.find((p) => p.id === item.productoId);
    if (!producto) {
      res.status(400).json({ error: `Producto no encontrado (id ${item.productoId})` });
      return;
    }
    total += producto.precio * item.cantidad;
    detalle.push({
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: item.cantidad,
      precio_unitario: producto.precio,
    });
  }

  const { data: estadoPedido } = await supabaseAdmin
    .from("estados_pedido")
    .select("id")
    .eq("nombre", body.estadoPedidoNombre ?? "Confirmado")
    .single();

  const { data: estadoPago } = await supabaseAdmin
    .from("estados_pago")
    .select("id")
    .eq("nombre", body.estadoPagoNombre ?? "Pagado")
    .single();

  const { data: pedido, error: pedidoError } = await supabaseAdmin
    .from("pedidos")
    .insert({
      perfil_id: null,
      cliente_nombre: body.nombre,
      cliente_apellidos: body.apellidos,
      cliente_telefono: body.telefono,
      cliente_email: body.email,
      metodo_entrega: body.metodoEntrega,
      direccion_entrega: body.direccionEntrega ?? null,
      poblacion_entrega: body.poblacionEntrega ?? null,
      provincia_entrega: body.provinciaEntrega ?? null,
      codigo_postal_entrega: body.codigoPostalEntrega ?? null,
      fecha_entrega: body.fechaEntrega,
      total,
      notas: body.notas ?? null,
      estado_pedido_id: estadoPedido?.id ?? 2, // 2 = "Confirmado" por default en el seed
      estado_pago_id: estadoPago?.id ?? 2, // 2 = "Pagado" por default en el seed
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    console.error("Error creando pedido manual:", pedidoError);
    res.status(500).json({ error: "No se pudo crear el pedido" });
    return;
  }

  const detalleConPedido = detalle.map((d) => ({ ...d, pedido_id: pedido.id }));
  const { error: detalleError } = await supabaseAdmin
    .from("detalle_pedido")
    .insert(detalleConPedido);

  if (detalleError) {
    res.status(500).json({ error: "No se pudo guardar el detalle del pedido" });
    return;
  }

  res.status(200).json({ pedidoId: pedido.id });
}
