import { useState } from "react";
import AdminPedidos from "./admin/AdminPedidos";

type Tab = "pedidos" | "productos" | "usuarios";

const Admin = () => {
  const [tab, setTab] = useState<Tab>("pedidos");

  const tabs: { id: Tab; label: string }[] = [
    { id: "pedidos", label: "Pedidos" },
    { id: "productos", label: "Productos" },
    { id: "usuarios", label: "Usuarios" },
  ];

  return (
    <section className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-serif font-medium text-foreground mb-8">
          Panel de administración
        </h1>

        <div className="flex gap-2 mb-8 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-sans font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "pedidos" && <AdminPedidos />}
        {tab === "productos" && (
          <p className="text-muted-foreground font-sans">
            Próximamente: alta, edición y baja de productos.
          </p>
        )}
        {tab === "usuarios" && (
          <p className="text-muted-foreground font-sans">
            Próximamente: gestión de usuarios y roles.
          </p>
        )}
      </div>
    </section>
  );
};

export default Admin;
