import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";

type Historia = Database["public"]["Tables"]["historias_clientes"]["Row"];

const fetchHistorias = async (): Promise<Historia[]> => {
  const { data, error } = await supabase
    .from("historias_clientes")
    .select("*")
    .eq("activo", true)
    .order("orden")
    .order("id");
  if (error) throw error;
  return data ?? [];
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
    {Array.from({ length: 5 }).map((_, index) => {
      const fillAmount = Math.min(Math.max(rating - index, 0), 1) * 100;
      return (
        <span key={index} className="relative w-4 h-4">
          <Star className="absolute inset-0 w-4 h-4 fill-none text-muted-foreground/40" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillAmount}%` }}>
            <Star className="w-4 h-4 fill-accent text-accent" />
          </span>
        </span>
      );
    })}
  </div>
);

const ClientStories = () => {
  const {
    data: historias,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["historias-clientes"],
    queryFn: fetchHistorias,
  });

  return (
    <section id="client-stories" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
            Lo que dicen
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            Historias de Clientes
          </h2>
        </div>

        {isLoading && (
          <p className="text-center text-muted-foreground font-sans">Cargando historias...</p>
        )}

        {isError && (
          <p className="text-center text-muted-foreground font-sans">
            No pudimos cargar las historias. Probá recargar la página.
          </p>
        )}

        {historias && historias.length === 0 && (
          <p className="text-center text-muted-foreground font-sans">
            Todavía no hay historias cargadas.
          </p>
        )}

        {historias && historias.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {historias.map((story, index) => (
              <motion.div
                key={story.id}
                variants={item}
                className={`bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex-col ${
                  index < 3 ? "flex" : "hidden sm:flex"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    {story.foto_url ? (
                      <AvatarImage src={story.foto_url} alt={story.nombre} />
                    ) : null}
                    <AvatarFallback className="font-serif text-lg bg-secondary text-secondary-foreground">
                      {getInitials(story.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-serif font-medium text-foreground">{story.nombre}</h3>
                    <StarRating rating={Number(story.puntaje)} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  &ldquo;{story.descripcion}&rdquo;
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ClientStories;
