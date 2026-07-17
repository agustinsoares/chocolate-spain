import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";

// Stripe necesita el body CRUDO (sin parsear) para poder verificar la
// firma del webhook — si Vercel lo parsea como JSON antes, la firma
// no matchea y constructEvent() falla siempre.
export const config = {
    api: {
        bodyParser: false,
    },
};

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const resendApiKey = process.env.RESEND_API_KEY!;

const stripe = new Stripe(stripeSecretKey);
const resend = new Resend(resendApiKey);

function buffer(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

async function marcarComoPagadoYAvisar(supabaseAdmin: any, pedidoId: number) {
    const { data: estadoPagado } = await supabaseAdmin
        .from("estados_pago")
        .select("id")
        .eq("nombre", "Pagado")
        .single();

    if (!estadoPagado) {
        console.error("No se encontró el estado 'Pagado' en estados_pago");
        return;
    }

    const { data: pedido, error: pedidoError } = await supabaseAdmin
        .from("pedidos")
        .update({ estado_pago_id: estadoPagado.id })
        .eq("id", pedidoId)
        .select("id, cliente_nombre, cliente_email, total, metodo_entrega, fecha_entrega")
        .single();

    if (pedidoError || !pedido) {
        console.error("No se pudo actualizar el pedido:", pedidoError);
        return;
    }

    const { data: detalle } = await supabaseAdmin
        .from("detalle_pedido")
        .select("producto_nombre, cantidad, precio_unitario")
        .eq("pedido_id", pedidoId);

    const filas = (detalle ?? [])
        .map(
            (d: any) =>
                `<tr><td style="padding:4px 8px">${d.cantidad}x ${d.producto_nombre}</td><td style="padding:4px 8px;text-align:right">${(d.precio_unitario * d.cantidad).toFixed(2)} €</td></tr>`
        )
        .join("");

    const entregaTexto =
        pedido.metodo_entrega === "domicilio" ? "Envío a domicilio" : "Retiro en el local";

    try {
        await resend.emails.send({
            from: "Chocolate <onboarding@resend.dev>",
            to: pedido.cliente_email,
            subject: `¡Tu pedido #${pedido.id} fue confirmado!`,
            html: `
        <div style="font-family: sans-serif; color: #2b1c14;">
          <h2>¡Gracias, ${pedido.cliente_nombre}!</h2>
          <p>Confirmamos que tu pago fue recibido. Tu pedido #${pedido.id} ya está en preparación.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            ${filas}
          </table>
          <p><strong>Total: ${pedido.total.toFixed(2)} €</strong></p>
          <p>${entregaTexto} — fecha: ${pedido.fecha_entrega}</p>
          <p>¡Gracias por tu compra!</p>
        </div>
      `,
        });
    } catch (emailError) {
        // Si el email falla, no revertimos el pago — el pedido ya está
        // marcado como pagado en la base, que es lo importante.
        console.error("Error enviando email de confirmación:", emailError);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Método no permitido" });
        return;
    }

    const sig = req.headers["stripe-signature"];
    const rawBody = await buffer(req);

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
    } catch (err) {
        console.error("Firma de webhook inválida:", err);
        res.status(400).json({ error: "Firma inválida" });
        return;
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const pedidoId = session.metadata?.pedido_id;

        if (pedidoId) {
            await marcarComoPagadoYAvisar(supabaseAdmin, Number(pedidoId));
        }
    }

    if (event.type === "checkout.session.async_payment_failed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const pedidoId = session.metadata?.pedido_id;

        if (pedidoId) {
            const { data: estadoFallido } = await supabaseAdmin
                .from("estados_pago")
                .select("id")
                .eq("nombre", "Fallido")
                .single();

            if (estadoFallido) {
                await supabaseAdmin
                    .from("pedidos")
                    .update({ estado_pago_id: estadoFallido.id })
                    .eq("id", Number(pedidoId));
            }
        }
    }

    // Siempre 200 para que Stripe no siga reintentando eventos ya procesados.
    res.status(200).json({ received: true });
}