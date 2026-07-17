import { motion } from "framer-motion";
import heroCake from "@/assets/hero-cake.png";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const scrollToProducts = () => {
  const target = document.getElementById("products");
  if (!target) return;

  const startY = window.scrollY;
  const targetY = target.getBoundingClientRect().top + startY;
  const distance = targetY - startY;
  const duration = 1200; // ms — transición despacio, a propósito
  let startTime: number | null = null;

  const step = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

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
            Pastelería <br />100% artesanal<br />
            <span className="italic text-accent">hecha con amor</span>
          </h1>
          <p className="text-lg text-muted-foreground font-sans font-light max-w-md mx-auto md:mx-0 mb-8">
            Elaboración de tartas y brownies con los mejores ingredientes, horneados especialmente para tí.
          </p>
          <button
            type="button"
            onClick={scrollToProducts}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-sans font-medium text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Pedir ahora
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 flex justify-center"
        >
          <div className="relative w-3/4 h-[260px] mx-auto md:w-96 md:h-auto">
            <img
              src={heroCake}
              alt="Torta Rogel artesanal"
              className="w-full h-full md:h-auto rounded-3xl shadow-2xl object-cover"
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