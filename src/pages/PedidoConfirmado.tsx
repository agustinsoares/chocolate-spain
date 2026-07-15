import { Link, useSearchParams } from "react-router-dom";

const PedidoConfirmado = () => {
    const [searchParams] = useSearchParams();
    const pedidoId = searchParams.get("pedido");

    return (
        <section className="py-20 bg-background min-h-screen">
            <div className="container mx-auto px-6 max-w-md text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
                    ¡Gracias!
                </p>
                <h1 className="text-4xl font-serif font-medium text-foreground mb-6">
                    Pedido recibido
                </h1>
                <p className="text-muted-foreground font-sans leading-relaxed mb-8">
                    {pedidoId ? `Tu pedido #${pedidoId} fue recibido` : "Tu pedido fue recibido"} y estamos
                    confirmando el pago. Te vamos a avisar por email en cuanto quede confirmado.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center text-sm font-sans font-medium text-primary hover:text-accent transition-colors"
                >
                    Volver al inicio
                </Link>
            </div>
        </section>
    );
};

export default PedidoConfirmado;