import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatPrecio = (valor: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);

function fechaMinima(): string {
    const min = new Date(Date.now() + 48 * 60 * 60 * 1000);
    return min.toISOString().slice(0, 10);
}

const Checkout = () => {
    const { items, totalPrecio, clearCart } = useCart();
    const { session } = useAuth();

    const [loading, setLoading] = useState(false);
    const [metodoEntrega, setMetodoEntrega] = useState<"retiro" | "domicilio">("retiro");
    const [direccion, setDireccion] = useState("");
    const [poblacion, setPoblacion] = useState("");
    const [provincia, setProvincia] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState(fechaMinima());
    const [notas, setNotas] = useState("");

    // Solo hacen falta si no hay sesión — si estás logueado, el backend
    // saca estos datos de tu perfil.
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");

    if (items.length === 0) {
        return (
            <section className="py-20 bg-background min-h-screen">
                <div className="container mx-auto px-6 max-w-md text-center">
                    <p className="text-muted-foreground font-sans">Tu carrito está vacío.</p>
                </div>
            </section>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (
            metodoEntrega === "domicilio" &&
            (!direccion || !poblacion || !provincia || !codigoPostal)
        ) {
            toast.error("Completá la dirección de envío");
            return;
        }

        if (!session && (!nombre || !apellidos || !telefono || !email)) {
            toast.error("Completá tus datos de contacto");
            return;
        }

        setLoading(true);

        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (session) {
                headers.Authorization = `Bearer ${session.access_token}`;
            }

            const res = await fetch("/api/crear-sesion-checkout", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
                    metodoEntrega,
                    direccionEntrega: direccion,
                    poblacionEntrega: poblacion,
                    provinciaEntrega: provincia,
                    codigoPostalEntrega: codigoPostal,
                    fechaEntrega,
                    notas,
                    // Se ignoran en el backend si hay sesión iniciada.
                    nombre,
                    apellidos,
                    telefono,
                    email,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error ?? "No se pudo iniciar el pago");
                setLoading(false);
                return;
            }

            clearCart();
            window.location.href = data.url;
        } catch {
            toast.error("Error de conexión al iniciar el pago");
            setLoading(false);
        }
    };

    return (
        <section className="py-20 bg-background min-h-screen">
            <div className="container mx-auto px-6 max-w-lg">
                <div className="text-center mb-10">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
                        Un paso más
                    </p>
                    <h1 className="text-4xl font-serif font-medium text-foreground">Finalizar pedido</h1>
                </div>

                <div className="space-y-2 mb-8">
                    {items.map((item) => (
                        <div key={item.productoId} className="flex justify-between text-sm font-sans">
                            <span>
                                {item.cantidad}x {item.nombre}
                            </span>
                            <span>{formatPrecio(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-sm font-sans font-medium text-foreground border-t border-border pt-2 mt-2">
                        <span>Total</span>
                        <span>{formatPrecio(totalPrecio)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!session && (
                        <div className="space-y-4 pb-2">
                            <p className="text-xs text-muted-foreground font-sans">
                                Podés pedir sin crear cuenta. Si preferís,{" "}
                                <Link to="/login" className="text-primary hover:text-accent font-medium">
                                    iniciá sesión
                                </Link>{" "}
                                y no vas a tener que cargar estos datos cada vez.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre</Label>
                                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Apellidos</Label>
                                    <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Teléfono</Label>
                                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>Método de entrega</Label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 text-sm font-sans">
                                <input
                                    type="radio"
                                    checked={metodoEntrega === "retiro"}
                                    onChange={() => setMetodoEntrega("retiro")}
                                />
                                Retiro
                            </label>
                            <label className="flex items-center gap-2 text-sm font-sans">
                                <input
                                    type="radio"
                                    checked={metodoEntrega === "domicilio"}
                                    onChange={() => setMetodoEntrega("domicilio")}
                                />
                                Envío a domicilio
                            </label>
                        </div>
                    </div>

                    {metodoEntrega === "domicilio" && (
                        <div className="space-y-4">
                            <div>
                                <Label>Dirección</Label>
                                <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Población</Label>
                                    <Input value={poblacion} onChange={(e) => setPoblacion(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Provincia</Label>
                                    <Input value={provincia} onChange={(e) => setProvincia(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Código postal</Label>
                                <Input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>Fecha de entrega</Label>
                        <Input
                            type="date"
                            min={fechaMinima()}
                            value={fechaEntrega}
                            onChange={(e) => setFechaEntrega(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground font-sans mt-1">
                            Mínimo 48hs de anticipación.
                        </p>
                    </div>

                    <div>
                        <Label>Notas (opcional)</Label>
                        <Input
                            placeholder='Ej: "Feliz cumpleaños Ana"'
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Redirigiendo a pago..." : `Pagar ${formatPrecio(totalPrecio)}`}
                    </Button>
                </form>
            </div>
        </section>
    );
};

export default Checkout;