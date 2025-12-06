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
          is_active: boolean;
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
          is_active?: boolean;
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
          is_active?: boolean;
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
          capacity: number;
          amenities: string[];
          hourly_rate: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          capacity?: number;
          amenities?: string[];
          hourly_rate?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          capacity?: number;
          amenities?: string[];
          hourly_rate?: number | null;
          is_active?: boolean;
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
      availability: {
        Row: {
          id: string;
          business_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
          is_closed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          day_of_week: number;
          open_time: string;
          close_time: string;
          is_closed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          day_of_week?: number;
          open_time?: string;
          close_time?: string;
          is_closed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'availability_business_id_fkey';
            columns: ['business_id'];
            referencedRelation: 'businesses';
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

export type Availability = Database['public']['Tables']['availability']['Row'];
export type InsertAvailability = Database['public']['Tables']['availability']['Insert'];
export type UpdateAvailability = Database['public']['Tables']['availability']['Update'];

// Helper type for availability with day name
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
