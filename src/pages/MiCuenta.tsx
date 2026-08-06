import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Phone, ShieldCheck, Sparkles, UserRound } from "lucide-react";
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

const perfilSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresá tu nombre"),
  apellidos: z.string().trim().min(1, "Ingresá tus apellidos"),
  telefono: z.string().trim().min(6, "Ingresá un teléfono válido"),
});

type PerfilForm = z.infer<typeof perfilSchema>;

const MiCuenta = () => {
  const { perfil, session, refreshPerfil } = useAuth();
  const [guardando, setGuardando] = useState(false);

  const form = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre: "", apellidos: "", telefono: "" },
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MiCuenta;
