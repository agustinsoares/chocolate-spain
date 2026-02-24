import { motion } from "framer-motion";
import heroCake from "@/assets/hero-cake.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-cream-light">
      <div className="container mx-auto px-6 py-16 flex flex-col-reverse md:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center md:text-left"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans font-medium">
            Valencia, España
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight text-foreground mb-6">
            Pastelería artesanal<br />
            <span className="italic text-accent">hecha con amor</span>
          </h1>
          <p className="text-lg text-muted-foreground font-sans font-light max-w-md mx-auto md:mx-0 mb-8">
            Postres artesanales elaborados con los mejores ingredientes, horneados al momento para cada pedido en el corazón de Valencia.
          </p>
          <a
            href="https://wa.me/34663110412"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-sans font-medium text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Pedir ahora
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 flex justify-center"
        >
          <div className="relative w-72 md:w-96">
            <img
              src={heroCake}
              alt="Torta Rogel artesanal"
              className="w-full h-auto rounded-3xl shadow-2xl object-cover"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-secondary rounded-full blur-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
