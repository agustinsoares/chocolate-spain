import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Shield, UserRound } from "lucide-react";
import logoImg from "@/assets/logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WHATSAPP_ORDER_MESSAGE = "Hola! Me encantaría hacerte un pedido.";
const WHATSAPP_HREF = `https://wa.me/34663110412?text=${encodeURIComponent(WHATSAPP_ORDER_MESSAGE)}`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { session, perfil, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const iniciales = `${perfil?.nombre?.[0] ?? ""}${perfil?.apellidos?.[0] ?? ""}`.toUpperCase();

  const cerrarSesion = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="Ir al inicio">
          <img src={logoImg} alt="Chocolate" className="h-7 w-auto" />
        </Link>
        
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/#products" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Productos
          </Link>
          <Link to="/#about" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Nosotros
          </Link>
          <Link to="/#client-stories" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Clientes
          </Link>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-sans bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Contacto
          </a>

          {!loading && (
            session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Abrir menú de mi cuenta"
                  >
                    {iniciales || <UserRound className="h-4 w-4" />}
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuLabel className="font-normal">
                    <span className="block font-medium truncate">
                      {perfil?.nombre || "Mi cuenta"}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {perfil?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link to="/mi-cuenta">
                      <UserRound className="mr-2 h-4 w-4" />
                      Mis datos
                    </Link>
                  </DropdownMenuItem>
                  {perfil?.rol === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Panel admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={cerrarSesion}
                    className="cursor-pointer rounded-lg text-muted-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Iniciar sesión"
              >
                <LogIn className="h-4 w-4" />
              </Link>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-foreground"
          aria-label="Abrir o cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <Link to="/#products" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground">
                Productos
              </Link>
              <Link to="/#about" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground">
                Nosotros
              </Link>
              <Link to="/#client-stories" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground">
                Clientes
              </Link>
              {!loading && session && (
                <>
                  <div className="h-px bg-border" />
                  <Link
                    to="/mi-cuenta"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-sm font-sans text-foreground"
                  >
                    <span className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                      {iniciales || <UserRound className="h-4 w-4" />}
                    </span>
                    Mi cuenta
                  </Link>
                  {perfil?.rol === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 text-sm font-sans text-muted-foreground"
                    >
                      <Shield className="h-4 w-4" />
                      Panel admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      void cerrarSesion();
                    }}
                    className="flex items-center gap-3 text-sm font-sans text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </>
              )}
              {!loading && !session && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-sm font-sans text-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              )}
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-sans bg-primary text-primary-foreground px-5 py-2 rounded-lg text-center"
              >
                Contacto
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
