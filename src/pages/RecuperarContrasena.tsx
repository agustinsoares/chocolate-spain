import { useState } from "react";
import { Link } from "react-router-dom";
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

const schema = z.object({
  email: z.string().email("Email inválido"),
});

type FormValues = z.infer<typeof schema>;

const RecuperarContrasena = () => {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/nueva-contrasena`,
      });

      if (error) {
        toast.error("No se pudo enviar el correo", {
          description: error.message,
        });
        return;
      }

      setEnviado(true);
      toast.success("Revisá tu email", {
        description: "Si hay una cuenta con ese correo, vas a recibir el enlace.",
      });
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
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
            Recuperar contraseña
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-sans">
            Te enviamos un enlace para elegir una nueva.
          </p>
        </div>

        {enviado ? (
          <div className="rounded-xl border border-border bg-card/70 p-6 text-center space-y-4">
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Si existe una cuenta con ese email, vas a recibir un correo en breve.
              Revisá también spam.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-sans text-primary hover:text-accent font-medium"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="vos@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
          </Form>
        )}

        {!enviado && (
          <p className="text-center text-sm text-muted-foreground mt-6 font-sans">
            <Link to="/login" className="text-primary hover:text-accent font-medium">
              Volver al login
            </Link>
          </p>
        )}
      </div>
    </section>
  );
};

export default RecuperarContrasena;
