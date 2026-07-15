import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";

type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];

interface SignUpInput {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  signUp: (
    input: SignUpInput
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarPerfil = async (userId: string) => {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error cargando perfil:", error.message);
      setPerfil(null);
      return;
    }
    setPerfil(data);
  };

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!activo) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      setSession(nuevaSesion);
      setUser(nuevaSesion?.user ?? null);
      if (nuevaSesion?.user) {
        cargarPerfil(nuevaSesion.user.id);
      } else {
        setPerfil(null);
      }
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ nombre, apellidos, telefono, email, password }: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, apellidos, telefono },
      },
    });

    if (error) return { error: error.message, needsEmailConfirmation: false };

    // Si en Supabase Auth está activado "Confirm email", data.session viene
    // null hasta que el usuario confirme desde su correo.
    const needsEmailConfirmation = !data.session;
    return { error: null, needsEmailConfirmation };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, perfil, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
