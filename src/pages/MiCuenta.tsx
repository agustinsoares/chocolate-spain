import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  Lock,
  MapPin,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";

const perfilSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresá tu nombre"),
  apellidos: z.string().trim().min(1, "Ingresá tus apellidos"),
  telefono: z.string().trim().min(6, "Ingresá un teléfono válido"),
});

const passwordSchema = z
  .object({
    actual: z.string().min(1, "Ingresá tu contraseña actual"),
    nueva: z.string().min(6, "Mínimo 6 caracteres"),
    confirmar: z.string(),
  })
  .refine((data) => data.nueva === data.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

type PerfilForm = z.infer<typeof perfilSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type PedidoRow = Database["public"]["Tables"]["pedidos"]["Row"];

type PedidoItem = {
  id: number;
  pedido_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  notas: string | null;
};

type PedidoCliente = PedidoRow & {
  estado_pedido: string;
  estado_pago: string;
  items: PedidoItem[];
};

const formatPrecio = (valor: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);

const formatFecha = (valor: string) => {
  const fecha = new Date(valor.includes("T") ? valor : `${valor}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return valor;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
};

const formatFechaHora = (valor: string) => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
};

const MiCuenta = () => {
  const { perfil, session, refreshPerfil } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [pedidoAbierto, setPedidoAbierto] = useState<number | null>(null);

  const { data: pedidos = [], isLoading: cargandoPedidos } = useQuery({
    queryKey: ["mis-pedidos", session?.user.id],
    enabled: Boolean(session?.access_token),
    queryFn: async (): Promise<PedidoCliente[]> => {
      const res = await fetch("/api/mis-pedidos", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudieron cargar los pedidos");
      return data.pedidos ?? [];
    },
  });

  const form = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre: "", apellidos: "", telefono: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { actual: "", nueva: "", confirmar: "" },
  });

  useEffect(() => {
    if (!perfil) return;
    form.reset({
      nombre: perfil.nombre,
      apellidos: perfil.apellidos,
      telefono: perfil.telefono ?? "",
    });
  }, [perfil, form]);

  const onSubmit = async (values: PerfilForm) => {
    setGuardando(true);
    try {
      const res = await fetch("/api/actualizar-mi-perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error("No se pudieron guardar los cambios", {
          description: data.error,
        });
        return;
      }

      await refreshPerfil();
      toast.success("Tus datos se actualizaron");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const onSubmitPassword = async (values: PasswordForm) => {
    if (!perfil?.email) {
      toast.error("No se pudo verificar tu cuenta");
      return;
    }

    setGuardandoPassword(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: perfil.email,
        password: values.actual,
      });

      if (verifyError) {
        toast.error("La contraseña actual no es correcta");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: values.nueva });
      if (error) {
        toast.error("No se pudo cambiar la contraseña", {
          description: error.message,
        });
        return;
      }

      passwordForm.reset();
      toast.success("Contraseña actualizada");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setGuardandoPassword(false);
    }
  };

  const iniciales = `${perfil?.nombre?.[0] ?? ""}${perfil?.apellidos?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      <main className="relative pt-28 pb-20">
        <motion.div
          aria-hidden
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-80 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative mx-auto px-6 max-w-5xl">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Tu espacio
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium">
              Mi cuenta
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Mantené tus datos al día para que cada pedido llegue a vos sin vueltas.
            </p>
          </motion.header>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
            <motion.aside
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-6"
            >
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif text-xl shadow-lg shadow-primary/10">
                {iniciales || <UserRound className="h-6 w-6" />}
              </div>
              <h2 className="mt-4 font-serif text-xl">
                {perfil?.nombre} {perfil?.apellidos}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground break-all">
                {perfil?.email}
              </p>

              <div className="h-px bg-border my-5" />

              <div className="flex items-start gap-3 text-sm">
                <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="font-medium">Cuenta protegida</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tu email de acceso no se modifica desde esta sección.
                  </p>
                </div>
              </div>
            </motion.aside>

            <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-6 md:p-8 shadow-sm"
            >
              <div className="mb-7">
                <h2 className="text-2xl font-serif">Datos personales</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Editá la información que usamos para contactarte.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10 bg-background/70" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellidos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos</FormLabel>
                          <FormControl>
                            <Input className="bg-background/70" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={perfil?.email ?? ""}
                        readOnly
                        className="pl-10 bg-muted/60 text-muted-foreground"
                      />
                    </div>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+34 663 110 412"
                              className="pl-10 bg-background/70"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-3 flex justify-end">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" disabled={guardando || !form.formState.isDirty}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Form>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-6 md:p-8 shadow-sm"
            >
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-accent" />
                  <h2 className="text-2xl font-serif">Seguridad</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cambiá tu contraseña. Vas a necesitar la actual para confirmar.
                </p>
              </div>

              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                  className="space-y-5"
                >
                  <FormField
                    control={passwordForm.control}
                    name="actual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input type="password" className="bg-background/70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="nueva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" className="bg-background/70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" className="bg-background/70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-1 flex justify-end">
                    <Button type="submit" disabled={guardandoPassword}>
                      {guardandoPassword ? "Actualizando..." : "Cambiar contraseña"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.section>
            </div>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="mt-8 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-6 md:p-8 shadow-sm"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-accent" />
                  <h2 className="text-2xl font-serif">Mis pedidos</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Historial de tus pedidos con productos, totales y estados.
                </p>
              </div>
              {!cargandoPedidos && pedidos.length > 0 && (
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground shrink-0 pt-1">
                  {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
                </span>
              )}
            </div>

            {cargandoPedidos ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-sans py-8 justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                Cargando pedidos...
              </div>
            ) : pedidos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/50 px-6 py-10 text-center">
                <Package className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-serif text-lg text-foreground">Todavía no tenés pedidos</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Cuando completes un pedido desde la web, va a aparecer acá con todo el detalle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((pedido, index) => {
                  const abierto = pedidoAbierto === pedido.id;
                  return (
                    <motion.div
                      key={pedido.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                      className="rounded-xl border border-border bg-background/60 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setPedidoAbierto(abierto ? null : pedido.id)}
                        className="w-full flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 text-left hover:bg-muted/40 transition-colors"
                      >
                        <div>
                          <p className="font-medium font-sans text-foreground">
                            Pedido #{pedido.id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Realizado el {formatFechaHora(pedido.creado_en)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:gap-3 font-sans text-sm">
                          <span className="font-medium">{formatPrecio(pedido.total)}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                            {pedido.estado_pago}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground">
                            {pedido.estado_pedido}
                          </span>
                          <motion.span
                            animate={{ rotate: abierto ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-muted-foreground"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.span>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {abierto && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border p-4 md:p-5 font-sans text-sm space-y-5">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                                    Entrega
                                  </p>
                                  <p className="capitalize">
                                    {pedido.metodo_entrega === "domicilio" ? "A domicilio" : "Retiro"}
                                  </p>
                                  <p className="text-muted-foreground mt-1">
                                    Fecha: {formatFecha(pedido.fecha_entrega)}
                                  </p>
                                </div>

                                {pedido.metodo_entrega === "domicilio" && (
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5" />
                                      Dirección
                                    </p>
                                    <p>
                                      {[
                                        pedido.direccion_entrega,
                                        pedido.poblacion_entrega,
                                        pedido.provincia_entrega,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                      {pedido.codigo_postal_entrega
                                        ? ` (${pedido.codigo_postal_entrega})`
                                        : ""}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {pedido.notas && (
                                <div>
                                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                                    Notas
                                  </p>
                                  <p className="text-foreground/90">{pedido.notas}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
                                  Productos
                                </p>
                                <div className="space-y-2">
                                  {pedido.items.length === 0 ? (
                                    <p className="text-muted-foreground">Sin detalle disponible.</p>
                                  ) : (
                                    pedido.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex justify-between gap-4 rounded-lg bg-muted/40 px-3 py-2.5"
                                      >
                                        <div>
                                          <p className="text-foreground">
                                            {item.cantidad}× {item.producto_nombre}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatPrecio(item.precio_unitario)} c/u
                                            {item.notas ? ` · ${item.notas}` : ""}
                                          </p>
                                        </div>
                                        <span className="shrink-0 font-medium">
                                          {formatPrecio(item.precio_unitario * item.cantidad)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-border">
                                <span className="text-muted-foreground">Total</span>
                                <span className="text-lg font-serif font-medium">
                                  {formatPrecio(pedido.total)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MiCuenta;
