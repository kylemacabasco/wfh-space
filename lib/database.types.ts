// Database types for Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          address: string;
          city: string;
          state: string | null;
          zip_code: string | null;
          amenities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          address: string;
          city: string;
          state?: string | null;
          zip_code?: string | null;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          address?: string;
          city?: string;
          state?: string | null;
          zip_code?: string | null;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'businesses_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      desks: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          hourly_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          hourly_rate: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          hourly_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'desks_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          }
        ];
      };
      date_availability: {
        Row: {
          id: string;
          business_id: string;
          available_date: string; // DATE as ISO string YYYY-MM-DD
          open_time: string;      // TIME as HH:MM:SS
          close_time: string;     // TIME as HH:MM:SS
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          available_date: string;
          open_time: string;
          close_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          available_date?: string;
          open_time?: string;
          close_time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'date_availability_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          }
        ];
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          desk_id: string;
          reservation_date: string; // DATE as ISO string YYYY-MM-DD
          start_time: string;       // TIME as HH:MM:SS
          end_time: string;         // TIME as HH:MM:SS
          duration_hours: number;
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          desk_id: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          duration_hours: number;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string;
          desk_id?: string;
          reservation_date?: string;
          start_time?: string;
          end_time?: string;
          duration_hours?: number;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_desk_id_fkey';
            columns: ['desk_id'];
            referencedRelation: 'desks';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];

export type Business = Database['public']['Tables']['businesses']['Row'];
export type InsertBusiness = Database['public']['Tables']['businesses']['Insert'];
export type UpdateBusiness = Database['public']['Tables']['businesses']['Update'];

export type Desk = Database['public']['Tables']['desks']['Row'];
export type InsertDesk = Database['public']['Tables']['desks']['Insert'];
export type UpdateDesk = Database['public']['Tables']['desks']['Update'];

export type DateAvailability = Database['public']['Tables']['date_availability']['Row'];
export type InsertDateAvailability = Database['public']['Tables']['date_availability']['Insert'];
export type UpdateDateAvailability = Database['public']['Tables']['date_availability']['Update'];

export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type InsertReservation = Database['public']['Tables']['reservations']['Insert'];
export type UpdateReservation = Database['public']['Tables']['reservations']['Update'];
