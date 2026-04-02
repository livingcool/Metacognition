// Placeholder types for Supabase schema
// These will be generated using 'supabase gen types typescript' later
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: { Row: any; Insert: any; Update: any };
      sessions: { Row: any; Insert: any; Update: any };
      messages: { Row: any; Insert: any; Update: any };
      cognitive_profiles: { Row: any; Insert: any; Update: any };
      research_chunks: { Row: any; Insert: any; Update: any };
      decisions: { Row: any; Insert: any; Update: any };
      session_chunks: { Row: any; Insert: any; Update: any };
      daily_cognitive_snapshots: { Row: any; Insert: any; Update: any };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
