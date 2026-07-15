import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

const WHATSAPP_URL = "https://wa.me/34663110412";

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

const fetchProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("id", { ascending: true });

  if (error) throw error;
  return data ?? [];
};

const ProductCard = ({ producto }: { producto: Producto }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const agotado = producto.cupo_disponible !== null && producto.cupo_disponible <= 0;

  const handleMouseEnter = () => {
    if (!producto.video_url) return;
    setIsPlaying(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    if (!producto.video_url) return;
    setIsPlaying(false);
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  };

  return (
    <motion.div
      variants={item}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-square overflow-hidden relative">
        {producto.imagen_url && (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${isPlaying ? "opacity-0" : "opacity-100"
              }`}
          />
        )}
        {producto.video_url && (
          <video
            ref={videoRef}
            src={producto.video_url}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${isPlaying ? "opacity-100" : "opacity-0"
              }`}
          />
        )}
        {agotado && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-sm font-sans font-medium uppercase tracking-wide text-foreground">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-serif font-medium text-foreground mb-2">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-4 flex-1">
            {producto.descripcion}
          </p>
        )}
        {!agotado && (
          <a
            href={`${WHATSAPP_URL}?text=Hola! Me gustaría pedir ${producto.nombre}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-sans font-medium text-primary hover:text-accent transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Pedir por WhatsApp
          </a>
        )}
      </div>
    </motion.div>
  );
};

const ProductGrid = () => {
  const {
    data: productos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productos"],
    queryFn: fetchProductos,
  });

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3 font-sans">
            Nuestra selección
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            Nuestras Delicias
          </h2>
        </div>

        {isLoading && (
          <p className="text-center text-muted-foreground font-sans">Cargando productos...</p>
        )}

        {isError && (
          <p className="text-center text-muted-foreground font-sans">
            No pudimos cargar los productos. Probá recargar la página.
          </p>
        )}

        {productos && productos.length === 0 && (
          <p className="text-center text-muted-foreground font-sans">
            Todavía no hay productos cargados.
          </p>
        )}

        {productos && productos.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;