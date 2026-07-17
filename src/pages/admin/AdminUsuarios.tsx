import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];

const fetchPerfiles = async (): Promise<Perfil[]> => {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const AdminUsuarios = () => {
  const { session, user } = useAuth();
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");

  const { data: perfiles, isLoading } = useQuery({
    queryKey: ["admin-perfiles"],
    queryFn: fetchPerfiles,
  });

  const actualizarPerfil = async (
    perfilId: string,
    cambios: { rol?: "cliente" | "admin"; activo?: boolean }
  ) => {
    try {
      const res = await fetch("/api/admin-actualizar-perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ perfilId, ...cambios }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo actualizar el usuario");
        return;
      }
      toast.success("Usuario actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-perfiles"] });
    } catch {
      toast.error("Error de conexión");
    }
  };

  const cambiarRol = (perfil: Perfil, nuevoRol: "cliente" | "admin") => {
    if (perfil.id === user?.id && nuevoRol !== "admin") {
      const confirmar = window.confirm(
        "Te estás sacando tu propio rol de admin. Vas a perder acceso a este panel. ¿Continuar?"
      );
      if (!confirmar) return;
    }
    actualizarPerfil(perfil.id, { rol: nuevoRol });
  };

  const cambiarActivo = (perfil: Perfil, activo: boolean) => {
    actualizarPerfil(perfil.id, { activo });
  };

  if (isLoading) {
    return <p className="text-muted-foreground font-sans">Cargando usuarios...</p>;
  }

  const termino = busqueda.trim().toLowerCase();
  const perfilesFiltrados = (perfiles ?? []).filter((p) => {
    if (!termino) return true;
    return (
      p.nombre.toLowerCase().includes(termino) ||
      p.apellidos.toLowerCase().includes(termino) ||
      p.email.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre, apellido o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-md"
      />

      {perfilesFiltrados.length === 0 && (
        <p className="text-muted-foreground font-sans">No se encontraron usuarios.</p>
      )}

      <div className="space-y-3">
        {perfilesFiltrados.map((perfil) => (
          <div
            key={perfil.id}
            className="bg-card rounded-xl border border-border p-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="font-sans">
              <p className="font-medium text-foreground">
                {perfil.nombre} {perfil.apellidos}
                {perfil.id === user?.id && (
                  <span className="text-xs text-muted-foreground"> (vos)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {perfil.email} · {perfil.telefono ?? "sin teléfono"}
              </p>
            </div>

            <div className="flex items-center gap-3 font-sans text-sm">
              <select
                value={perfil.rol}
                onChange={(e) => cambiarRol(perfil, e.target.value as "cliente" | "admin")}
                className="border border-border rounded-md px-3 py-2 bg-background"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={perfil.activo}
                  onChange={(e) => cambiarActivo(perfil, e.target.checked)}
                />
                Activo
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsuarios;