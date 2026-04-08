// Placeholder types for Supabase schema
// These will be generated using 'supabase gen types typescript' later
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: { 
        Row: { id: string; [key: string]: any }; 
        Insert: { id?: string; [key: string]: any }; 
        Update: { id?: string; [key: string]: any };
      };
      sessions: { 
        Row: { id: string; [key: string]: any }; 
        Insert: { id?: string; [key: string]: any }; 
        Update: { id?: string; [key: string]: any };
      };
      messages: { 
        Row: { id: string; session_id: string; role: string; content: string; metadata?: any; created_at?: string }; 
        Insert: { id?: string; session_id: string; role: string; content: string; metadata?: any; created_at?: string }; 
        Update: { id?: string; session_id?: string; role?: string; content?: string; metadata?: any; created_at?: string };
      };
      cognitive_profiles: { 
        Row: { user_id: string; dominant_patterns?: any; belief_update_rate?: number; calibration_score?: number; updated_at?: string }; 
        Insert: { user_id: string; dominant_patterns?: any; belief_update_rate?: number; calibration_score?: number; updated_at?: string }; 
        Update: { user_id?: string; dominant_patterns?: any; belief_update_rate?: number; calibration_score?: number; updated_at?: string };
      };
      research_chunks: { 
        Row: { id: string; content: string; embedding: number[]; [key: string]: any }; 
        Insert: { id?: string; content: string; embedding: number[]; [key: string]: any }; 
        Update: { id?: string; content?: string; embedding?: number[]; [key: string]: any };
      };
      decisions: { 
        Row: { id: string; user_id: string; session_id: string; description: string; predicted_confidence: number; assumptions: string[]; status: string; created_at?: string }; 
        Insert: { id?: string; user_id: string; session_id: string; description: string; predicted_confidence: number; assumptions: string[]; status?: string; created_at?: string }; 
        Update: { id?: string; user_id?: string; session_id?: string; description?: string; predicted_confidence?: number; assumptions?: string[]; status?: string; created_at?: string };
      };
      session_chunks: { 
        Row: { id: string; user_id: string; session_id: string; content: string; embedding: number[]; created_at?: string }; 
        Insert: { id?: string; user_id: string; session_id: string; content: string; embedding: number[]; created_at?: string }; 
        Update: { id?: string; user_id?: string; session_id?: string; content?: string; embedding?: number[]; created_at?: string };
      };
      daily_cognitive_snapshots: { 
        Row: { id: string; user_id: string; snapshot_date: string; calibration_score: number; assumption_load: number; belief_update_count: number; dominant_bias: string; radar_data: any; created_at?: string }; 
        Insert: { id?: string; user_id: string; snapshot_date: string; calibration_score: number; assumption_load: number; belief_update_count: number; dominant_bias: string; radar_data: any; created_at?: string }; 
        Update: { id?: string; user_id?: string; snapshot_date?: string; calibration_score?: number; assumption_load?: number; belief_update_count?: number; dominant_bias?: string; radar_data?: any; created_at?: string };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
