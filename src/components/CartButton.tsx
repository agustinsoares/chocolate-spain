import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const formatPrecio = (valor: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);

const CartButton = () => {
  const { items, updateCantidad, removeItem, totalItems, totalPrecio } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-accent transition-colors"
        aria-label="Ver carrito"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-sans font-medium">
            {totalItems}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-serif">Tu carrito</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground font-sans mt-6">
              Todavía no agregaste nada.
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productoId} className="flex gap-3 items-center">
                  {item.imagenUrl && (
                    <img
                      src={item.imagenUrl}
                      alt={item.nombre}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-foreground truncate">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      {formatPrecio(item.precio)} c/u
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateCantidad(item.productoId, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted"
                        aria-label="Restar"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-sans w-4 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateCantidad(item.productoId, item.cantidad + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted"
                        aria-label="Sumar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productoId)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Quitar del carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm font-sans font-medium text-foreground">
                <span>Total</span>
                <span>{formatPrecio(totalPrecio)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Finalizar pedido
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CartButton;