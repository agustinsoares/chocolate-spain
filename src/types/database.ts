// Tipos generados a mano a partir de schemachocolatespain.sql.
// Cuando tengas la Supabase CLI instalada, lo ideal es reemplazar este
// archivo por el output real de:
//   supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.ts
// así los tipos quedan 100% sincronizados con la base ante cualquier cambio.

export type Rol = "cliente" | "admin";
export type MetodoEntrega = "retiro" | "domicilio";

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          nombre: string;
          apellidos: string;
          telefono: string | null;
          email: string;
          rol: Rol;
          activo: boolean;
          creado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["perfiles"]["Row"]> & {
          id: string;
          nombre: string;
          apellidos: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfiles"]["Row"]>;
      };
      categorias: {
        Row: {
          id: number;
          nombre: string;
          orden: number;
        };
        Insert: Partial<Database["public"]["Tables"]["categorias"]["Row"]> & {
          nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["categorias"]["Row"]>;
      };
      productos: {
        Row: {
          id: number;
          categoria_id: number | null;
          nombre: string;
          descripcion: string | null;
          precio: number;
          imagen_url: string | null;
          video_url: string | null;
          cupo_disponible: number | null;
          activo: boolean;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["productos"]["Row"]> & {
          nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["productos"]["Row"]>;
      };
      estados_pedido: {
        Row: { id: number; nombre: string };
        Insert: { id?: number; nombre: string };
        Update: Partial<{ id: number; nombre: string }>;
      };
      estados_pago: {
        Row: { id: number; nombre: string };
        Insert: { id?: number; nombre: string };
        Update: Partial<{ id: number; nombre: string }>;
      };
      pedidos: {
        Row: {
          id: number;
          perfil_id: string;
          cliente_nombre: string;
          cliente_apellidos: string;
          cliente_telefono: string;
          cliente_email: string;
          metodo_entrega: MetodoEntrega;
          direccion_entrega: string | null;
          poblacion_entrega: string | null;
          provincia_entrega: string | null;
          codigo_postal_entrega: string | null;
          fecha_pedido: string;
          fecha_entrega: string;
          estado_pedido_id: number;
          estado_pago_id: number;
          total: number;
          notas: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          creado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pedidos"]["Row"]> & {
          perfil_id: string;
          cliente_nombre: string;
          cliente_apellidos: string;
          cliente_telefono: string;
          cliente_email: string;
          fecha_entrega: string;
        };
        Update: Partial<Database["public"]["Tables"]["pedidos"]["Row"]>;
      };
      detalle_pedido: {
        Row: {
          id: number;
          pedido_id: number;
          producto_id: number | null;
          producto_nombre: string;
          cantidad: number;
          precio_unitario: number;
          notas: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["detalle_pedido"]["Row"]> & {
          pedido_id: number;
          producto_nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["detalle_pedido"]["Row"]>;
      };
      contacto: {
        Row: {
          id: number;
          perfil_id: string | null;
          nombre: string;
          email: string | null;
          telefono: string | null;
          mensaje: string;
          respondido: boolean;
          creado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contacto"]["Row"]> & {
          nombre: string;
          mensaje: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacto"]["Row"]>;
      };
    };
  };
}
