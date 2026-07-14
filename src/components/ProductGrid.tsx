import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import rogelImg from "@/assets/rogel.png";
import keyLimeImg from "@/assets/key-lime-pie.png";
import marquiseImg from "@/assets/marquise.png";
import havanetteImg from "@/assets/havanette.png";
import browniesImg from "@/assets/brownies.png";
import applePieImg from "@/assets/apple-pie.png";
import appleCrumbleImg from "@/assets/apple-crumble.png";
import keyLimeVideo from "@/assets/videos/key-lime-pie.mp4";
import havanetteVideo from "@/assets/videos/havanette.mp4";
import applePieVideo from "@/assets/videos/apple-pie.mp4";

interface Product {
  name: string;
  description: string;
  image: string;
  video?: string;
}

const products: Product[] = [
  {
    name: "Rogel",
    description: "Crocantes capas recubiertas del más delicioso dulce de leche y coronadas con merengue italiano.",
    image: rogelImg,
  },
  {
    name: "Tarta de lima",
    description: "Base crujiente, deliciosa y suave crema de limas y decorada con nata montada.",
    image: keyLimeImg,
    video: keyLimeVideo,
  },
  {
    name: "Torta Marquise",
    description: "Base húmeda de brownie, dulce de leche y nata montada.",
    image: marquiseImg,
  },
  {
    name: "Havanette",
    description: "Masa sablé rellena de dulce de leche y cubierta de una fina y suave capa de chocolate.",
    image: havanetteImg,
    video: havanetteVideo,
  },
  {
    name: "Brownies",
    description: "Crujientes por fuera y húmedos y deliciosos por dentro.",
    image: browniesImg,
  },
  {
    name: "Tarta de manzana",
    description: "Tierna masa rellena de deliciosas manzanas con canela y cubierta de almendras fileteadas.",
    image: applePieImg,
    video: applePieVideo,
  },
  {
    name: "Apple Crumble",
    description: "Base de masa tierna, relleno de manzanas con canela y topping de crujiente crumble.",
    image: appleCrumbleImg,
  },
];

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

const useHoverCapable = () => {
  const [hoverCapable, setHoverCapable] = useState(
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handleChange = (event: MediaQueryListEvent) => setHoverCapable(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return hoverCapable;
};

const ProductCard = ({ product }: { product: Product }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const isHoverCapable = useHoverCapable();

  // isPlaying tracks the video's actual playback state (not just intent), so the
  // photo/video crossfade only happens once a frame is ready — no black flash on mobile.
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    videoEl.addEventListener("playing", handlePlaying);
    videoEl.addEventListener("pause", handlePause);
    return () => {
      videoEl.removeEventListener("playing", handlePlaying);
      videoEl.removeEventListener("pause", handlePause);
    };
  }, []);

  // On touch devices there's no hover, so autoplay the video as it scrolls into view.
  useEffect(() => {
    if (isHoverCapable || !product.video) return;
    const node = mediaRef.current;
    const videoEl = videoRef.current;
    if (!node || !videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
          videoEl.currentTime = 0;
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isHoverCapable, product.video]);

  const handleMouseEnter = () => {
    if (!product.video || !isHoverCapable) return;
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    if (!product.video || !isHoverCapable) return;
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  };

  return (
    <motion.div
      variants={item}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={mediaRef} className="aspect-square overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />
        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif font-medium text-foreground mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-4">
          {product.description}
        </p>
        <a
          href={`${WHATSAPP_URL}?text=Hola! Me gustaría pedir ${product.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-sans font-medium text-primary hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Pedir por WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

const ProductGrid = () => {
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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;
