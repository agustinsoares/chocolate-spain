import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
            Nuestra historia
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-8">
            About <span className="italic">Chocolate</span>
          </h2>
          <p className="text-muted-foreground font-sans leading-relaxed mb-6">
            Born from a family passion for baking, <strong className="text-foreground font-medium">Chocolate</strong> brings the rich traditions of Argentine pastry to the vibrant streets of Valencia. Every recipe has been perfected over generations, using only the finest ingredients — real butter, premium chocolate, and hand-whipped dulce de leche.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed">
            We believe that the best desserts are made with patience, love, and attention to every detail. Each cake is baked fresh to order, because you deserve nothing less than perfection.
          </p>
          <div className="mt-10 flex items-center justify-center gap-1 text-accent">
            <span className="text-2xl">✦</span>
            <span className="text-lg">✦</span>
            <span className="text-2xl">✦</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
