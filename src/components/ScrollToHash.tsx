import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Alto del navbar fijo, para que la sección no quede tapada.
const NAV_OFFSET = 64;
const MAX_INTENTOS = 20;

const ScrollToHash = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    let intentos = 0;
    let frame = 0;

    const scrollear = () => {
      const el = document.getElementById(id);

      if (!el) {
        // La sección puede montarse después que la ruta.
        if (intentos++ < MAX_INTENTOS) frame = requestAnimationFrame(scrollear);
        return;
      }

      const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    };

    frame = requestAnimationFrame(scrollear);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToHash;
