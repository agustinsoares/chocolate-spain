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
            Sobre <span className="italic">Chocolate</span>
          </h2>
          <p className="text-muted-foreground font-sans leading-relaxed mb-6">
            Nacido de una pasión familiar por la repostería, <strong className="text-foreground font-medium">Chocolate</strong> lleva las ricas tradiciones de la pastelería argentina a las calles de Valencia. Cada receta se ha perfeccionado durante generaciones, con los mejores ingredientes: manteca real, chocolate premium y dulce de leche batido a mano.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Creemos que los mejores postres se hacen con paciencia, amor y atención al detalle. Cada torta se hornea al momento, porque no te merecés menos que lo mejor.
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
