// Tipos generados a mano a partir de schemachocolatespain.sql.
// Cuando tengas la Supabase CLI instalada, lo ideal es reemplazar este
// archivo por el output real de:
//   supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.ts
//
// @supabase/postgrest-js exige Relationships en cada tabla y Views/Functions
// en el schema; sin eso, .from(...).select() infiere `never`.

export type Rol = "cliente" | "admin";
export type MetodoEntrega = "retiro" | "domicilio";

export type Database = {
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
        Insert: {
          id: string;
          nombre: string;
          apellidos: string;
          telefono?: string | null;
          email: string;
          rol?: Rol;
          activo?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          apellidos?: string;
          telefono?: string | null;
          email?: string;
          rol?: Rol;
          activo?: boolean;
          creado_en?: string;
        };
        Relationships: [];
      };
      categorias: {
        Row: {
          id: number;
          nombre: string;
          orden: number;
        };
        Insert: {
          id?: number;
          nombre: string;
          orden?: number;
        };
        Update: {
          id?: number;
          nombre?: string;
          orden?: number;
        };
        Relationships: [];
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
        Insert: {
          id?: number;
          categoria_id?: number | null;
          nombre: string;
          descripcion?: string | null;
          precio?: number;
          imagen_url?: string | null;
          video_url?: string | null;
          cupo_disponible?: number | null;
          activo?: boolean;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: number;
          categoria_id?: number | null;
          nombre?: string;
          descripcion?: string | null;
          precio?: number;
          imagen_url?: string | null;
          video_url?: string | null;
          cupo_disponible?: number | null;
          activo?: boolean;
          creado_en?: string;
          actualizado_en?: string;
        };
        Relationships: [];
      };
      estados_pedido: {
        Row: { id: number; nombre: string };
        Insert: { id?: number; nombre: string };
        Update: { id?: number; nombre?: string };
        Relationships: [];
      };
      estados_pago: {
        Row: { id: number; nombre: string };
        Insert: { id?: number; nombre: string };
        Update: { id?: number; nombre?: string };
        Relationships: [];
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
        Insert: {
          id?: number;
          perfil_id: string;
          cliente_nombre: string;
          cliente_apellidos: string;
          cliente_telefono: string;
          cliente_email: string;
          metodo_entrega?: MetodoEntrega;
          direccion_entrega?: string | null;
          poblacion_entrega?: string | null;
          provincia_entrega?: string | null;
          codigo_postal_entrega?: string | null;
          fecha_pedido?: string;
          fecha_entrega: string;
          estado_pedido_id?: number;
          estado_pago_id?: number;
          total?: number;
          notas?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: number;
          perfil_id?: string;
          cliente_nombre?: string;
          cliente_apellidos?: string;
          cliente_telefono?: string;
          cliente_email?: string;
          metodo_entrega?: MetodoEntrega;
          direccion_entrega?: string | null;
          poblacion_entrega?: string | null;
          provincia_entrega?: string | null;
          codigo_postal_entrega?: string | null;
          fecha_pedido?: string;
          fecha_entrega?: string;
          estado_pedido_id?: number;
          estado_pago_id?: number;
          total?: number;
          notas?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          creado_en?: string;
        };
        Relationships: [];
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
        Insert: {
          id?: number;
          pedido_id: number;
          producto_id?: number | null;
          producto_nombre: string;
          cantidad?: number;
          precio_unitario?: number;
          notas?: string | null;
        };
        Update: {
          id?: number;
          pedido_id?: number;
          producto_id?: number | null;
          producto_nombre?: string;
          cantidad?: number;
          precio_unitario?: number;
          notas?: string | null;
        };
        Relationships: [];
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
        Insert: {
          id?: number;
          perfil_id?: string | null;
          nombre: string;
          email?: string | null;
          telefono?: string | null;
          mensaje: string;
          respondido?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: number;
          perfil_id?: string | null;
          nombre?: string;
          email?: string | null;
          telefono?: string | null;
          mensaje?: string;
          respondido?: boolean;
          creado_en?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
