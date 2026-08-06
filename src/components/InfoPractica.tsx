import { motion } from "framer-motion";
import { CalendarClock, MapPin, MessageCircle, Truck } from "lucide-react";

const WHATSAPP_HREF = `https://wa.me/34663110412?text=${encodeURIComponent(
  "Hola! Me encantaría hacerte un pedido."
)}`;

const puntos = [
  {
    icon: CalendarClock,
    titulo: "Pedí con antelación",
    texto: "Necesitamos mínimo 48 horas para elaborar todo fresco y artesanal.",
  },
  {
    icon: Truck,
    titulo: "Retiro o envío",
    texto: "Podés retirar tu pedido o pedirlo a domicilio en Valencia.",
  },
  {
    icon: MapPin,
    titulo: "Valencia",
    texto: "Coordinamos día y franja de entrega o retiro al confirmar el pedido.",
  },
  {
    icon: MessageCircle,
    titulo: "WhatsApp",
    texto: "Consultas y pedidos por WhatsApp al +34 663 110 412.",
  },
];

const InfoPractica = () => {
  return (
    <section id="info" className="py-20 bg-background relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute top-10 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
            Info práctica
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-4">
            Cómo funciona
          </h2>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Todo lo que necesitás saber antes de encargar tu pedido.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 max-w-3xl mx-auto">
          {puntos.map((punto, index) => (
            <motion.div
              key={punto.titulo}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex gap-4"
            >
              <div className="h-11 w-11 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                <punto.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground mb-1.5">{punto.titulo}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  {punto.texto}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14 text-center"
        >
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-sans font-medium text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Escribinos por WhatsApp
          </a>
          <p className="mt-4 text-xs text-muted-foreground font-sans">
            También en Instagram{" "}
            <a
              href="https://instagram.com/chocolatespain"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors"
            >
              @chocolatespain
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default InfoPractica;
