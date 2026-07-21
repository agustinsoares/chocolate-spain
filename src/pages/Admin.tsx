import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import AdminPedidos from "./admin/AdminPedidos";
import AdminProductos from "./admin/AdminProductos";
import AdminUsuarios from "./admin/AdminUsuarios";
import AdminCatalogo from "./admin/AdminCatalogo";

type Tab = "pedidos" | "productos" | "usuarios" | "catalogo";

const Admin = () => {
  const [tab, setTab] = useState<Tab>("pedidos");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const tabs: { id: Tab; label: string }[] = [
    { id: "pedidos", label: "Pedidos" },
    { id: "productos", label: "Productos" },
    { id: "usuarios", label: "Usuarios" },
    { id: "catalogo", label: "Catálogo" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <section className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Chocolate" className="h-14 w-auto" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground mb-8 text-center">
          Panel de administración
        </h1>

        <div className="flex items-center justify-between gap-2 mb-8 border-b border-border">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-sans font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-sans font-medium text-muted-foreground hover:text-destructive whitespace-nowrap transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {tab === "pedidos" && <AdminPedidos />}
        {tab === "productos" && <AdminProductos />}
        {tab === "usuarios" && <AdminUsuarios />}
        {tab === "catalogo" && <AdminCatalogo />}
      </div>
    </section>
  );
};

export default Admin;