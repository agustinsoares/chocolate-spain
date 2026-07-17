import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

const formatPrecio = (valor: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);

const fetchProductosAdmin = async (): Promise<Producto[]> => {
  const { data, error } = await supabase.from("productos").select("*").order("id");
  if (error) throw error;
  return data ?? [];
};

const subirArchivo = async (
  file: File,
  productoId: number | string,
  tipo: "imagen" | "video"
): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${productoId}-${tipo}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("productos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("productos").getPublicUrl(path);
  return data.publicUrl;
};

interface FormState {
  nombre: string;
  descripcion: string;
  precio: string;
  cupoDisponible: string; // "" = sin límite
  activo: boolean;
  imagenUrl: string | null;
  videoUrl: string | null;
}

const vacio: FormState = {
  nombre: "",
  descripcion: "",
  precio: "0",
  cupoDisponible: "",
  activo: true,
  imagenUrl: null,
  videoUrl: null,
};

const AdminProductos = () => {
  const queryClient = useQueryClient();
  const { data: productos, isLoading } = useQuery({
    queryKey: ["admin-productos"],
    queryFn: fetchProductosAdmin,
  });

  const [creando, setCreando] = useState(false);
  const [formNuevo, setFormNuevo] = useState<FormState>(vacio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdicion, setFormEdicion] = useState<FormState>(vacio);
  const [subiendo, setSubiendo] = useState(false);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
  const invalidarPublico = () => queryClient.invalidateQueries({ queryKey: ["productos"] });

  const abrirEdicion = (p: Producto) => {
    setEditandoId(p.id);
    setFormEdicion({
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: String(p.precio),
      cupoDisponible: p.cupo_disponible === null ? "" : String(p.cupo_disponible),
      activo: p.activo,
      imagenUrl: p.imagen_url,
      videoUrl: p.video_url,
    });
  };

  const guardarEdicion = async (id: number) => {
    const { error } = await supabase
      .from("productos")
      .update({
        nombre: formEdicion.nombre,
        descripcion: formEdicion.descripcion || null,
        precio: Number(formEdicion.precio) || 0,
        cupo_disponible: formEdicion.cupoDisponible === "" ? null : Number(formEdicion.cupoDisponible),
        activo: formEdicion.activo,
        imagen_url: formEdicion.imagenUrl,
        video_url: formEdicion.videoUrl,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("No se pudo guardar el producto");
      return;
    }
    toast.success("Producto actualizado");
    setEditandoId(null);
    invalidar();
    invalidarPublico();
  };

  const crearProducto = async () => {
    if (!formNuevo.nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const { error } = await supabase.from("productos").insert({
      nombre: formNuevo.nombre,
      descripcion: formNuevo.descripcion || null,
      precio: Number(formNuevo.precio) || 0,
      cupo_disponible: formNuevo.cupoDisponible === "" ? null : Number(formNuevo.cupoDisponible),
      activo: formNuevo.activo,
      imagen_url: formNuevo.imagenUrl,
      video_url: formNuevo.videoUrl,
    });

    if (error) {
      toast.error("No se pudo crear el producto");
      return;
    }
    toast.success("Producto creado");
    setCreando(false);
    setFormNuevo(vacio);
    invalidar();
    invalidarPublico();
  };

  const eliminarProducto = async (id: number) => {
    if (!window.confirm("¿Eliminar definitivamente este producto? Esta acción no se puede deshacer.")) {
      return;
    }
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar (probá desactivarlo en vez de borrarlo)");
      return;
    }
    toast.success("Producto eliminado");
    invalidar();
    invalidarPublico();
  };

  const handleUpload = async (
    file: File,
    productoId: number | string,
    tipo: "imagen" | "video",
    esNuevo: boolean
  ) => {
    setSubiendo(true);
    try {
      const url = await subirArchivo(file, productoId, tipo);
      if (esNuevo) {
        setFormNuevo((prev) => ({ ...prev, [tipo === "imagen" ? "imagenUrl" : "videoUrl"]: url }));
      } else {
        setFormEdicion((prev) => ({ ...prev, [tipo === "imagen" ? "imagenUrl" : "videoUrl"]: url }));
      }
      toast.success(`${tipo === "imagen" ? "Imagen" : "Video"} subido`);
    } catch {
      toast.error("No se pudo subir el archivo");
    } finally {
      setSubiendo(false);
    }
  };

  const renderForm = (
    form: FormState,
    setForm: (f: FormState) => void,
    idParaArchivos: number | string,
    esNuevo: boolean
  ) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <Label>Precio (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Input
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <Label>Cupo disponible (vacío = sin límite)</Label>
          <Input
            type="number"
            value={form.cupoDisponible}
            onChange={(e) => setForm({ ...form, cupoDisponible: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-sans pb-2">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
          />
          Activo (visible en el sitio)
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Imagen</Label>
          {form.imagenUrl && (
            <img src={form.imagenUrl} alt="" className="w-24 h-24 object-cover rounded-lg mb-2" />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={subiendo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file, idParaArchivos, "imagen", esNuevo);
            }}
            className="text-sm font-sans"
          />
        </div>
        <div>
          <Label>Video (opcional)</Label>
          {form.videoUrl && (
            <video src={form.videoUrl} muted className="w-24 h-24 object-cover rounded-lg mb-2" />
          )}
          <input
            type="file"
            accept="video/*"
            disabled={subiendo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file, idParaArchivos, "video", esNuevo);
            }}
            className="text-sm font-sans"
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <p className="text-muted-foreground font-sans">Cargando productos...</p>;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setCreando((v) => !v);
          setFormNuevo(vacio);
        }}
      >
        {creando ? "Cancelar" : "Nuevo producto"}
      </Button>

      {creando && (
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          {renderForm(formNuevo, setFormNuevo, "nuevo", true)}
          <Button onClick={crearProducto} disabled={subiendo} className="w-full">
            Crear producto
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {productos?.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 font-sans">
                {p.imagen_url && (
                  <img src={p.imagen_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                )}
                <div>
                  <p className="font-medium text-foreground">{p.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrecio(p.precio)} ·{" "}
                    {p.cupo_disponible === null ? "sin límite" : `cupo: ${p.cupo_disponible}`} ·{" "}
                    {p.activo ? "activo" : "inactivo"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => (editandoId === p.id ? setEditandoId(null) : abrirEdicion(p))}
                >
                  {editandoId === p.id ? "Cerrar" : "Editar"}
                </Button>
                <button
                  onClick={() => eliminarProducto(p.id)}
                  className="text-sm font-sans text-muted-foreground hover:text-destructive px-2"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {editandoId === p.id && (
              <div className="border-t border-border p-4 space-y-4">
                {renderForm(formEdicion, setFormEdicion, p.id, false)}
                <Button onClick={() => guardarEdicion(p.id)} disabled={subiendo} className="w-full">
                  Guardar cambios
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductos;
