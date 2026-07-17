import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import AdminPedidoManualForm from "./AdminPedidoManualForm";

type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];
type DetallePedido = Database["public"]["Tables"]["detalle_pedido"]["Row"];
type EstadoPedido = Database["public"]["Tables"]["estados_pedido"]["Row"];
type EstadoPago = Database["public"]["Tables"]["estados_pago"]["Row"];

const formatPrecio = (valor: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);

const fetchPedidos = async (): Promise<Pedido[]> => {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const fetchEstadosPedido = async (): Promise<EstadoPedido[]> => {
  const { data, error } = await supabase.from("estados_pedido").select("*").order("id");
  if (error) throw error;
  return data ?? [];
};

const fetchEstadosPago = async (): Promise<EstadoPago[]> => {
  const { data, error } = await supabase.from("estados_pago").select("*").order("id");
  if (error) throw error;
  return data ?? [];
};

const fetchDetalle = async (pedidoId: number): Promise<DetallePedido[]> => {
  const { data, error } = await supabase
    .from("detalle_pedido")
    .select("*")
    .eq("pedido_id", pedidoId);
  if (error) throw error;
  return data ?? [];
};

const AdminPedidos = () => {
  const queryClient = useQueryClient();
  const [pedidoAbierto, setPedidoAbierto] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<DetallePedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [mostrarFormManual, setMostrarFormManual] = useState(false);

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["admin-pedidos"],
    queryFn: fetchPedidos,
  });
  const { data: estadosPedido } = useQuery({
    queryKey: ["estados-pedido"],
    queryFn: fetchEstadosPedido,
  });
  const { data: estadosPago } = useQuery({
    queryKey: ["estados-pago"],
    queryFn: fetchEstadosPago,
  });

  const nombreEstadoPedido = (id: number) =>
    estadosPedido?.find((e) => e.id === id)?.nombre ?? "—";
  const nombreEstadoPago = (id: number) => estadosPago?.find((e) => e.id === id)?.nombre ?? "—";

  const toggleDetalle = async (pedidoId: number) => {
    if (pedidoAbierto === pedidoId) {
      setPedidoAbierto(null);
      return;
    }
    const rows = await fetchDetalle(pedidoId);
    setDetalle(rows);
    setPedidoAbierto(pedidoId);
  };

  const cambiarEstadoPedido = async (pedidoId: number, estadoPedidoId: number) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ estado_pedido_id: estadoPedidoId })
      .eq("id", pedidoId);

    if (error) {
      toast.error("No se pudo actualizar el estado");
      return;
    }
    toast.success("Estado actualizado");
    queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
  };

  const pedidosFiltrados = (pedidos ?? []).filter((p) => {
    if (filtroEstado === "todos") return true;
    return String(p.estado_pedido_id) === filtroEstado;
  });

  if (isLoading) {
    return <p className="text-muted-foreground font-sans">Cargando pedidos...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-sans text-muted-foreground">Filtrar por estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm font-sans bg-background"
          >
            <option value="todos">Todos</option>
            {estadosPedido?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setMostrarFormManual((v) => !v)}>
          {mostrarFormManual ? "Cancelar" : "Cargar pedido manual"}
        </Button>
      </div>

      {mostrarFormManual && (
        <AdminPedidoManualForm
          onCreado={() => {
            setMostrarFormManual(false);
            queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
          }}
        />
      )}

      <div className="space-y-3">
        {pedidosFiltrados.length === 0 && (
          <p className="text-muted-foreground font-sans">No hay pedidos para mostrar.</p>
        )}

        {pedidosFiltrados.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleDetalle(pedido.id)}
              className="w-full flex flex-wrap items-center justify-between gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="font-sans">
                <p className="font-medium text-foreground">
                  #{pedido.id} — {pedido.cliente_nombre} {pedido.cliente_apellidos}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entrega: {pedido.fecha_entrega} · {pedido.metodo_entrega}
                </p>
              </div>
              <div className="flex items-center gap-4 font-sans text-sm">
                <span>{formatPrecio(pedido.total)}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {nombreEstadoPago(pedido.estado_pago_id)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                  {nombreEstadoPedido(pedido.estado_pedido_id)}
                </span>
              </div>
            </button>

            {pedidoAbierto === pedido.id && (
              <div className="border-t border-border p-4 font-sans text-sm space-y-4">
                <div>
                  <p className="text-muted-foreground mb-1">Contacto</p>
                  <p>{pedido.cliente_email} · {pedido.cliente_telefono}</p>
                </div>

                {pedido.metodo_entrega === "domicilio" && (
                  <div>
                    <p className="text-muted-foreground mb-1">Dirección</p>
                    <p>
                      {pedido.direccion_entrega}, {pedido.poblacion_entrega},{" "}
                      {pedido.provincia_entrega} ({pedido.codigo_postal_entrega})
                    </p>
                  </div>
                )}

                {pedido.notas && (
                  <div>
                    <p className="text-muted-foreground mb-1">Notas</p>
                    <p>{pedido.notas}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground mb-1">Productos</p>
                  <div className="space-y-1">
                    {detalle.map((d) => (
                      <div key={d.id} className="flex justify-between">
                        <span>
                          {d.cantidad}x {d.producto_nombre}
                        </span>
                        <span>{formatPrecio(d.precio_unitario * d.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-muted-foreground">Cambiar estado:</label>
                  <select
                    value={pedido.estado_pedido_id}
                    onChange={(e) => cambiarEstadoPedido(pedido.id, Number(e.target.value))}
                    className="border border-border rounded-md px-3 py-2 bg-background"
                  >
                    {estadosPedido?.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPedidos;
