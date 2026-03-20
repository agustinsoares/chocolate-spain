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
            Este emprendimiento nació después de años elaborando postres, tartas y brownies para familiares y amigos. Con nuestra llegada a Valencia, esta tradición se transformó en un negocio que busca compartir los sabores argentinos, para que puedan ser disfrutados tanto por españoles como por latinoamericanos que encuentran en cada bocado la nostalgia de sus raíces.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed mb-6">
            Nuestro principal objetivo en <strong className="text-foreground font-medium">Chocolate</strong> es que cada cliente pueda, a través de una porción de tarta o unos deliciosos brownies, convertir cualquier momento en algo especial.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Creemos que las mejores recetas se crean con amor, dedicación y atención al detalle. Por eso, cada tarta se elabora de manera artesanal, con el mismo cariño de siempre. Porque no solo horneamos, sino que creamos momentos para disfrutar.
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
