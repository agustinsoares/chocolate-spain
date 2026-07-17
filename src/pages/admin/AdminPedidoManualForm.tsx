import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

interface ItemCarritoManual {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

const formatPrecio = (valor: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);

function fechaMinima(): string {
  return new Date().toISOString().slice(0, 10);
}

const fetchProductosActivos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  if (error) throw error;
  return data ?? [];
};

const AdminPedidoManualForm = ({ onCreado }: { onCreado: () => void }) => {
  const { session } = useAuth();
  const { data: productos } = useQuery({
    queryKey: ["admin-productos-activos"],
    queryFn: fetchProductosActivos,
  });

  const [items, setItems] = useState<ItemCarritoManual[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [metodoEntrega, setMetodoEntrega] = useState<"retiro" | "domicilio">("retiro");
  const [direccion, setDireccion] = useState("");
  const [poblacion, setPoblacion] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState(fechaMinima());
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const agregarItem = () => {
    const producto = productos?.find((p) => String(p.id) === productoSeleccionado);
    if (!producto || cantidadSeleccionada < 1) return;

    setItems((prev) => {
      const existente = prev.find((i) => i.productoId === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.productoId === producto.id
            ? { ...i, cantidad: i.cantidad + cantidadSeleccionada }
            : i
        );
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidadSeleccionada,
        },
      ];
    });
    setProductoSeleccionado("");
    setCantidadSeleccionada(1);
  };

  const quitarItem = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Agregá al menos un producto");
      return;
    }
    if (!nombre || !apellidos || !telefono || !email) {
      toast.error("Completá los datos de contacto del cliente");
      return;
    }
    if (
      metodoEntrega === "domicilio" &&
      (!direccion || !poblacion || !provincia || !codigoPostal)
    ) {
      toast.error("Completá la dirección de envío");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/crear-pedido-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
          nombre,
          apellidos,
          telefono,
          email,
          metodoEntrega,
          direccionEntrega: direccion,
          poblacionEntrega: poblacion,
          provinciaEntrega: provincia,
          codigoPostalEntrega: codigoPostal,
          fechaEntrega,
          notas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo crear el pedido");
        setLoading(false);
        return;
      }

      toast.success(`Pedido #${data.pedidoId} creado`);
      onCreado();
    } catch {
      toast.error("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-2xl p-6 border border-border">
      <div>
        <Label>Agregar producto</Label>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm font-sans bg-background"
          >
            <option value="">Elegí un producto...</option>
            {productos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {formatPrecio(p.precio)}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={cantidadSeleccionada}
              onChange={(e) => setCantidadSeleccionada(Number(e.target.value))}
              className="w-20 flex-shrink-0"
            />
            <Button type="button" onClick={agregarItem} className="flex-1 sm:flex-none">
              Agregar
            </Button>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productoId} className="flex justify-between items-center text-sm font-sans">
              <span>
                {item.cantidad}x {item.nombre}
              </span>
              <div className="flex items-center gap-3">
                <span>{formatPrecio(item.precio * item.cantidad)}</span>
                <button
                  type="button"
                  onClick={() => quitarItem(item.productoId)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-sans font-medium border-t border-border pt-2">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <Label>Apellidos</Label>
          <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Teléfono</Label>
          <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
        />
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <Input value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Crear pedido"}
      </Button>
    </form>
  );
};

export default AdminPedidoManualForm;