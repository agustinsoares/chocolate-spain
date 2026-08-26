import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "@/types/database";

type Historia = Database["public"]["Tables"]["historias_clientes"]["Row"];

const fetchHistoriasAdmin = async (): Promise<Historia[]> => {
  const { data, error } = await supabase
    .from("historias_clientes")
    .select("*")
    .order("orden")
    .order("id");
  if (error) throw error;
  return data ?? [];
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const clampPuntaje = (valor: string) => {
  const n = Number(valor);
  if (Number.isNaN(n)) return 0;
  const stepped = Math.round(n * 2) / 2;
  return Math.min(5, Math.max(0, stepped));
};

interface FormState {
  nombre: string;
  descripcion: string;
  puntaje: string;
  orden: string;
  activo: boolean;
  fotoUrl: string | null;
}

const vacio: FormState = {
  nombre: "",
  descripcion: "",
  puntaje: "5",
  orden: "0",
  activo: true,
  fotoUrl: null,
};

const AdminHistorias = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { data: historias, isLoading } = useQuery({
    queryKey: ["admin-historias"],
    queryFn: fetchHistoriasAdmin,
  });

  const [creando, setCreando] = useState(false);
  const [formNuevo, setFormNuevo] = useState<FormState>(vacio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdicion, setFormEdicion] = useState<FormState>(vacio);
  const [subiendo, setSubiendo] = useState(false);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["admin-historias"] });
  const invalidarPublico = () => queryClient.invalidateQueries({ queryKey: ["historias-clientes"] });

  const abrirEdicion = (h: Historia) => {
    setEditandoId(h.id);
    setFormEdicion({
      nombre: h.nombre,
      descripcion: h.descripcion,
      puntaje: String(Number(h.puntaje)),
      orden: String(h.orden),
      activo: h.activo,
      fotoUrl: h.foto_url,
    });
  };

  const payload = (form: FormState) => ({
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    puntaje: clampPuntaje(form.puntaje),
    orden: Number(form.orden) || 0,
    activo: form.activo,
    foto_url: form.fotoUrl,
  });

  const guardarEdicion = async (id: number) => {
    if (!formEdicion.nombre.trim() || !formEdicion.descripcion.trim()) {
      toast.error("Nombre y descripción son obligatorios");
      return;
    }
    const { error } = await supabase
      .from("historias_clientes")
      .update({
        ...payload(formEdicion),
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("No se pudo guardar la historia");
      return;
    }
    toast.success("Historia actualizada");
    setEditandoId(null);
    invalidar();
    invalidarPublico();
  };

  const crearHistoria = async () => {
    if (!formNuevo.nombre.trim() || !formNuevo.descripcion.trim()) {
      toast.error("Nombre y descripción son obligatorios");
      return;
    }
    const { error } = await supabase.from("historias_clientes").insert(payload(formNuevo));

    if (error) {
      toast.error("No se pudo crear la historia");
      return;
    }
    toast.success("Historia creada");
    setCreando(false);
    setFormNuevo(vacio);
    invalidar();
    invalidarPublico();
  };

  const eliminarHistoria = async (id: number) => {
    if (!window.confirm("¿Eliminar esta historia? Esta acción no se puede deshacer.")) {
      return;
    }
    const { error } = await supabase.from("historias_clientes").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    toast.success("Historia eliminada");
    invalidar();
    invalidarPublico();
  };

  const handleUpload = async (file: File, historiaId: number | string, esNuevo: boolean) => {
    setSubiendo(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `historias-${historiaId}-${Date.now()}.${ext}`;
      const fileBase64 = await fileToBase64(file);

      const res = await fetch("/api/subir-archivo-producto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ fileBase64, fileName, contentType: file.type }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo subir la foto");
        return;
      }

      if (esNuevo) {
        setFormNuevo((prev) => ({ ...prev, fotoUrl: data.url }));
      } else {
        setFormEdicion((prev) => ({ ...prev, fotoUrl: data.url }));
      }
      toast.success("Foto subida");
    } catch {
      toast.error("No se pudo subir la foto");
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
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {form.fotoUrl ? <AvatarImage src={form.fotoUrl} alt="" /> : null}
          <AvatarFallback className="font-serif text-lg bg-secondary text-secondary-foreground">
            {getInitials(form.nombre) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Label>Foto (opcional — si no hay, se usan las iniciales)</Label>
          <input
            type="file"
            accept="image/*"
            disabled={subiendo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file, idParaArchivos, esNuevo);
            }}
            className="text-sm font-sans mt-1"
          />
          {form.fotoUrl && (
            <button
              type="button"
              onClick={() => setForm({ ...form, fotoUrl: null })}
              className="block mt-1 text-xs font-sans text-muted-foreground hover:text-destructive"
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <Label>Puntaje (0 a 5, de a 0.5)</Label>
          <Input
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={form.puntaje}
            onChange={(e) => setForm({ ...form, puntaje: e.target.value })}
            onBlur={() => setForm({ ...form, puntaje: String(clampPuntaje(form.puntaje)) })}
          />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <Label>Orden</Label>
          <Input
            type="number"
            value={form.orden}
            onChange={(e) => setForm({ ...form, orden: e.target.value })}
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
    </div>
  );

  if (isLoading) {
    return <p className="text-muted-foreground font-sans">Cargando historias...</p>;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setCreando((v) => !v);
          setFormNuevo(vacio);
        }}
      >
        {creando ? "Cancelar" : "Nueva historia"}
      </Button>

      {creando && (
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          {renderForm(formNuevo, setFormNuevo, "nuevo", true)}
          <Button onClick={crearHistoria} disabled={subiendo} className="w-full">
            Crear historia
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {historias?.map((h) => (
          <div key={h.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 font-sans">
                <Avatar className="h-12 w-12">
                  {h.foto_url ? <AvatarImage src={h.foto_url} alt="" /> : null}
                  <AvatarFallback className="font-serif bg-secondary text-secondary-foreground">
                    {getInitials(h.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{h.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(h.puntaje)} ★ · orden {h.orden} · {h.activo ? "activo" : "inactivo"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => (editandoId === h.id ? setEditandoId(null) : abrirEdicion(h))}
                >
                  {editandoId === h.id ? "Cerrar" : "Editar"}
                </Button>
                <button
                  onClick={() => eliminarHistoria(h.id)}
                  className="text-sm font-sans text-muted-foreground hover:text-destructive px-2"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {editandoId === h.id && (
              <div className="border-t border-border p-4 space-y-4">
                {renderForm(formEdicion, setFormEdicion, h.id, false)}
                <Button onClick={() => guardarEdicion(h.id)} disabled={subiendo} className="w-full">
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

export default AdminHistorias;
