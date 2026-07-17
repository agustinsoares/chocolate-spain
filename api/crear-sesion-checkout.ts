import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

const stripe = new Stripe(stripeSecretKey);

interface CarritoItemInput {
  productoId: number;
  cantidad: number;
}

interface CrearSesionBody {
  items: CarritoItemInput[];
  metodoEntrega: "retiro" | "domicilio";
  direccionEntrega?: string;
  poblacionEntrega?: string;
  provinciaEntrega?: string;
  codigoPostalEntrega?: string;
  fechaEntrega: string; // ISO date (yyyy-mm-dd)
  notas?: string;
  // Solo se usan si el pedido es de un invitado (sin sesión iniciada).
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  email?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const body = req.body as CrearSesionBody;

  // --- 1. Datos de contacto: de la sesión si hay una, o del form si es invitado ---
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let usuarioId: string | null = null;
  let clienteNombre: string;
  let clienteApellidos: string;
  let clienteTelefono: string;
  let clienteEmail: string;

  if (token) {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      res.status(401).json({ error: "Sesión inválida" });
      return;
    }

    usuarioId = userData.user.id;

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("nombre, apellidos, telefono, email")
      .eq("id", usuarioId)
      .single();

    if (perfilError || !perfil) {
      console.error("Error buscando perfil:", perfilError, "usuario.id:", usuarioId);
      res.status(400).json({ error: "No se encontró el perfil del usuario" });
      return;
    }

    clienteNombre = perfil.nombre;
    clienteApellidos = perfil.apellidos;
    clienteTelefono = perfil.telefono ?? "";
    clienteEmail = perfil.email;
  } else {
    // Checkout como invitado: los datos de contacto vienen del formulario.
    if (!body?.nombre || !body?.apellidos || !body?.telefono || !body?.email) {
      res.status(400).json({ error: "Faltan tus datos de contacto" });
      return;
    }
    clienteNombre = body.nombre;
    clienteApellidos = body.apellidos;
    clienteTelefono = body.telefono;
    clienteEmail = body.email;
  }

  if (!body?.items?.length) {
    res.status(400).json({ error: "El carrito está vacío" });
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

  // --- 2. Regla de negocio: mínimo 48hs de anticipación ---
  const fechaEntrega = new Date(body.fechaEntrega);
  const minimo = new Date(Date.now() + 48 * 60 * 60 * 1000);
  if (Number.isNaN(fechaEntrega.getTime()) || fechaEntrega < minimo) {
    res.status(400).json({ error: "La fecha de entrega debe ser al menos 48hs después de ahora" });
    return;
  }

  // --- 3. Precios y cupo REALES desde la base, nunca del cliente ---
  const productoIds = body.items.map((i) => i.productoId);
  const { data: productos, error: productosError } = await supabaseAdmin
    .from("productos")
    .select("id, nombre, precio, cupo_disponible, activo")
    .in("id", productoIds);

  if (productosError || !productos) {
    res.status(500).json({ error: "No se pudieron validar los productos" });
    return;
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const detalle: {
    producto_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
  }[] = [];
  let total = 0;

  for (const item of body.items) {
    const producto = productos.find((p) => p.id === item.productoId);

    if (!producto || !producto.activo) {
      res.status(400).json({ error: `Producto no disponible (id ${item.productoId})` });
      return;
    }

    if (producto.cupo_disponible !== null && item.cantidad > producto.cupo_disponible) {
      res.status(400).json({
        error: `No hay suficiente cupo para "${producto.nombre}" (disponible: ${producto.cupo_disponible})`,
      });
      return;
    }

    total += producto.precio * item.cantidad;

    detalle.push({
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: item.cantidad,
      precio_unitario: producto.precio,
    });

    lineItems.push({
      quantity: item.cantidad,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(producto.precio * 100),
        product_data: { name: producto.nombre },
      },
    });
  }

  // --- 4. Crear el pedido (perfil_id queda null si es invitado) ---
  const { data: pedido, error: pedidoError } = await supabaseAdmin
    .from("pedidos")
    .insert({
      perfil_id: usuarioId,
      cliente_nombre: clienteNombre,
      cliente_apellidos: clienteApellidos,
      cliente_telefono: clienteTelefono,
      cliente_email: clienteEmail,
      metodo_entrega: body.metodoEntrega,
      direccion_entrega: body.direccionEntrega ?? null,
      poblacion_entrega: body.poblacionEntrega ?? null,
      provincia_entrega: body.provinciaEntrega ?? null,
      codigo_postal_entrega: body.codigoPostalEntrega ?? null,
      fecha_entrega: body.fechaEntrega,
      total,
      notas: body.notas ?? null,
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    console.error("Error creando pedido:", pedidoError);
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

  // --- 5. Sesión de Stripe Checkout ---
  const origin = req.headers.origin ?? process.env.SITE_URL ?? "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: clienteEmail,
    success_url: `${origin}/pedido-confirmado?pedido=${pedido.id}`,
    cancel_url: `${origin}/checkout?cancelado=1`,
    metadata: { pedido_id: String(pedido.id) },
  });

  await supabaseAdmin
    .from("pedidos")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", pedido.id);

  res.status(200).json({ url: session.url });
}