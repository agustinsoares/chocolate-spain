import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.svg";

const WHATSAPP_ORDER_MESSAGE = "Hola! Me encantaría hacerte un pedido.";
const WHATSAPP_HREF = `https://wa.me/34663110412?text=${encodeURIComponent(WHATSAPP_ORDER_MESSAGE)}`;

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#">
          <img src={logoImg} alt="Chocolate" className="h-7 w-auto" />
        </a>
        
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#products" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Productos
          </a>
          <a href="#about" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Nosotros
          </a>
          <a href="#client-stories" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Clientes
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-sans bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Contacto
          </a>
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
              <a href="#products" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground">
                Productos
              </a>
              <a href="#about" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground">
                Nosotros
              </a>
              <a href="#client-stories" onClick={() => setOpen(false)} className="text-sm font-sans text-muted-foreground">
                Clientes
              </a>
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
