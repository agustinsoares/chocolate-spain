import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VolverAlInicioProps {
  className?: string;
}

const VolverAlInicio = ({ className }: VolverAlInicioProps) => (
  <Button
    asChild
    variant="ghost"
    size="sm"
    className={cn(
      "-ml-3 text-muted-foreground hover:bg-transparent hover:text-accent font-sans",
      className
    )}
  >
    <Link to="/" aria-label="Volver al inicio">
      <ArrowLeft />
      Volver al inicio
    </Link>
  </Button>
);

export default VolverAlInicio;
