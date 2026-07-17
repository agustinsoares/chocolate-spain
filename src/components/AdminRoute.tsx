import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { session, perfil, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground font-sans">Cargando...</p>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (perfil?.rol !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;