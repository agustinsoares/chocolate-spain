import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
type EstadoPedido = Database["public"]["Tables"]["estados_pedido"]["Row"];
type EstadoPago = Database["public"]["Tables"]["estados_pago"]["Row"];

// --- Sección genérica para estados_pedido / estados_pago (solo id + nombre) ---
function SeccionEstados({
  titulo,
  tabla,
  queryKey,
}: {
  titulo: string;
  tabla: "estados_pedido" | "estados_pago";
  queryKey: string;
}) {
  const queryClient = useQueryClient();
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async (): Promise<EstadoPedido[] | EstadoPago[]> => {
      const { data, error } = await supabase.from(tabla).select("*").order("id");
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const agregar = async () => {
    if (!nuevoNombre.trim()) return;
    const { error } = await supabase.from(tabla).insert({ nombre: nuevoNombre.trim() });
    if (error) {
      toast.error("No se pudo agregar");
      return;
    }
    setNuevoNombre("");
    invalidar();
  };

  const guardar = async (id: number) => {
    if (!nombreEdicion.trim()) return;
    const { error } = await supabase.from(tabla).update({ nombre: nombreEdicion.trim() }).eq("id", id);
    if (error) {
      toast.error("No se pudo guardar");
      return;
    }
    setEditandoId(null);
    invalidar();
  };

  const eliminar = async (id: number) => {
    if (!window.confirm(`¿Eliminar este estado? Falla si algún pedido lo está usando.`)) return;
    const { error } = await supabase.from(tabla).delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar — probablemente está en uso por algún pedido");
      return;
    }
    invalidar();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-serif text-lg text-foreground mb-4">{titulo}</h3>

      {isLoading ? (
        <p className="text-sm text-muted-foreground font-sans">Cargando...</p>
      ) : (
        <div className="space-y-2 mb-4">
          {data?.map((estado) => (
            <div key={estado.id} className="flex items-center gap-2">
              {editandoId === estado.id ? (
                <>
                  <Input
                    value={nombreEdicion}
                    onChange={(e) => setNombreEdicion(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => guardar(estado.id)}>
                    Guardar
                  </Button>
                  <button
                    className="text-sm font-sans text-muted-foreground"
                    onClick={() => setEditandoId(null)}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-sans text-foreground">{estado.nombre}</span>
                  <button
                    className="text-sm font-sans text-primary hover:text-accent"
                    onClick={() => {
                      setEditandoId(estado.id);
                      setNombreEdicion(estado.nombre);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-sm font-sans text-muted-foreground hover:text-destructive"
                    onClick={() => eliminar(estado.id)}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Nuevo estado..."
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="flex-1"
        />
        <Button onClick={agregar}>Agregar</Button>
      </div>
    </div>
  );
}

// --- Sección de categorías (nombre + orden) ---
function SeccionCategorias() {
  const queryClient = useQueryClient();
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState("");
  const [ordenEdicion, setOrdenEdicion] = useState("0");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: async (): Promise<Categoria[]> => {
      const { data, error } = await supabase.from("categorias").select("*").order("orden");
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });

  const agregar = async () => {
    if (!nuevoNombre.trim()) return;
    const { error } = await supabase.from("categorias").insert({ nombre: nuevoNombre.trim() });
    if (error) {
      toast.error("No se pudo agregar (¿nombre repetido?)");
      return;
    }
    setNuevoNombre("");
    invalidar();
  };

  const guardar = async (id: number) => {
    const { error } = await supabase
      .from("categorias")
      .update({ nombre: nombreEdicion.trim(), orden: Number(ordenEdicion) || 0 })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo guardar");
      return;
    }
    setEditandoId(null);
    invalidar();
  };

  const eliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar esta categoría? Los productos que la usan quedan sin categoría.")) return;
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    invalidar();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-serif text-lg text-foreground mb-4">Categorías</h3>

      {isLoading ? (
        <p className="text-sm text-muted-foreground font-sans">Cargando...</p>
      ) : (
        <div className="space-y-2 mb-4">
          {data?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              {editandoId === cat.id ? (
                <>
                  <Input
                    value={nombreEdicion}
                    onChange={(e) => setNombreEdicion(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={ordenEdicion}
                    onChange={(e) => setOrdenEdicion(e.target.value)}
                    className="w-20"
                  />
                  <Button size="sm" onClick={() => guardar(cat.id)}>
                    Guardar
                  </Button>
                  <button
                    className="text-sm font-sans text-muted-foreground"
                    onClick={() => setEditandoId(null)}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-sans text-foreground">
                    {cat.nombre} <span className="text-muted-foreground">(orden: {cat.orden})</span>
                  </span>
                  <button
                    className="text-sm font-sans text-primary hover:text-accent"
                    onClick={() => {
                      setEditandoId(cat.id);
                      setNombreEdicion(cat.nombre);
                      setOrdenEdicion(String(cat.orden));
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-sm font-sans text-muted-foreground hover:text-destructive"
                    onClick={() => eliminar(cat.id)}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Nueva categoría..."
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="flex-1"
        />
        <Button onClick={agregar}>Agregar</Button>
      </div>
    </div>
  );
}

const AdminCatalogo = () => {
  return (
    <div className="space-y-6">
      <SeccionCategorias />
      <SeccionEstados titulo="Estados de pedido" tabla="estados_pedido" queryKey="admin-estados-pedido" />
      <SeccionEstados titulo="Estados de pago" tabla="estados_pago" queryKey="admin-estados-pago" />
    </div>
  );
};

export default AdminCatalogo;
