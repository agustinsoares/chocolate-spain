import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClientStory {
  name: string;
  photo?: string;
  text: string;
  rating: number;
}

const clientStories: ClientStory[] = [
  {
    name: "María González",
    photo: "",
    text: "Las tartas de Chocolate son una delicia, se nota el cariño en cada detalle. El dulce de leche sabe exactamente como el de casa.",
    rating: 5,
  },
  {
    name: "Julián Pérez",
    photo: "",
    text: "Pedí brownies para un cumpleaños y todos quedaron encantados. Repetiré seguro, la calidad es excelente.",
    rating: 5,
  },
  {
    name: "Carla Fernández",
    photo: "",
    text: "Encontrar sabores argentinos aquí en Valencia fue una gran sorpresa. El rogel es espectacular.",
    rating: 4,
  },
  {
    name: "Sofía Martínez",
    photo: "",
    text: "La torta Marquise es un pecado, húmeda y con la cantidad justa de dulce de leche. Llegó impecable a domicilio.",
    rating: 4.5,
  },
  {
    name: "Diego Herrera",
    photo: "",
    text: "El apple crumble tiene el punto exacto entre la manzana con canela y el crumble crocante. Ya es un clásico en casa.",
    rating: 5,
  },
  {
    name: "Lucía Romero",
    photo: "",
    text: "Pedí Havanette para agasajar a mi familia y no quedó ni un pedazo. Se nota que está hecho con dedicación.",
    rating: 4,
  },
];

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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {clientStories.map((story) => (
            <motion.div
              key={story.name}
              variants={item}
              className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={story.photo} alt={story.name} />
                  <AvatarFallback className="font-serif text-lg bg-secondary text-secondary-foreground">
                    {getInitials(story.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif font-medium text-foreground">{story.name}</h3>
                  <StarRating rating={story.rating} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                &ldquo;{story.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientStories;
