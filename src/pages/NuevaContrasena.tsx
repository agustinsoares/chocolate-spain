import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VolverAlInicio from "@/components/VolverAlInicio";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const NuevaContrasena = () => {
  const navigate = useNavigate();
  const [listo, setListo] = useState(false);
  const [errorSesion, setErrorSesion] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    let cancelado = false;

    const marcarListo = () => {
      if (cancelado) return;
      setListo(true);
      setErrorSesion(false);
    };

    const marcarError = () => {
      if (cancelado) return;
      setErrorSesion(true);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        marcarListo();
      }
    });

    const establecerSesionDesdeUrl = async () => {
      const hash = window.location.hash.replace(/^#/, "");
      const query = window.location.search.replace(/^\?/, "");
      const params = new URLSearchParams(hash || query);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error(error);
          marcarError();
          return;
        }
        window.history.replaceState({}, document.title, "/nueva-contrasena");
        marcarListo();
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        marcarListo();
        return;
      }

      // Da un momento al listener por si el redirect aún procesa el hash.
      window.setTimeout(() => {
        if (!cancelado) {
          void supabase.auth.getSession().then(({ data: s }) => {
            if (s.session) marcarListo();
            else marcarError();
          });
        }
      }, 800);
    };

    void establecerSesionDesdeUrl();

    return () => {
      cancelado = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setLoading(false);

    if (error) {
      toast.error("No se pudo actualizar la contraseña", {
        description: error.message,
      });
      return;
    }

    toast.success("Contraseña actualizada");
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-md">
        <VolverAlInicio className="mb-6" />

        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
            Cuenta
          </p>
          <h1 className="text-4xl font-serif font-medium text-foreground">
            Nueva contraseña
          </h1>
        </div>

        {errorSesion && !listo ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-center space-y-4">
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              El enlace no es válido o ya expiró. Pedí uno nuevo desde recuperar contraseña.
            </p>
            <Link
              to="/recuperar-contrasena"
              className="inline-block text-sm font-sans text-primary hover:text-accent font-medium"
            >
              Pedir nuevo enlace
            </Link>
          </div>
        ) : !listo ? (
          <p className="text-center text-sm text-muted-foreground font-sans">
            Validando enlace...
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </section>
  );
};

export default NuevaContrasena;
