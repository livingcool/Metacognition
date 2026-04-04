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
          email: string;
          created_at: string;
          updated_at: string;
          last_login: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: "active" | "completed" | "archived";
          created_at: string;
          ended_at: string | null;
          preview?: string;
          metadata?: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          status?: "active" | "completed" | "archived";
          created_at?: string;
          ended_at?: string;
          preview?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: "active" | "completed" | "archived";
          created_at?: string;
          ended_at?: string;
          preview?: string;
          metadata?: Json;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      cognitive_profiles: {
        Row: {
          user_id: string;
          dominant_patterns: string[];
          dna_history: Json;
          weekly_insight: string | null;
          calibration_score: number | null;
          belief_update_rate: number | null;
          radar_data: Json | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          dominant_patterns?: string[];
          dna_history?: Json;
          weekly_insight?: string | null;
          calibration_score?: number | null;
          belief_update_rate?: number | null;
          radar_data?: Json | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          dominant_patterns?: string[];
          dna_history?: Json;
          weekly_insight?: string | null;
          calibration_score?: number | null;
          belief_update_rate?: number | null;
          radar_data?: Json | null;
          updated_at?: string;
        };
      };
      research_chunks: {
        Row: {
          id: string;
          filename: string;
          content: string;
          embedding: number[];
          author: string;
          year: number;
          bias_categories: string[];
        };
        Insert: {
          id?: string;
          filename: string;
          content: string;
          embedding?: number[];
          author: string;
          year: number;
          bias_categories?: string[];
        };
        Update: {
          id?: string;
          filename?: string;
          content?: string;
          embedding?: number[];
          author?: string;
          year?: number;
          bias_categories?: string[];
        };
      };
      decisions: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          description: string;
          predicted_confidence: number;
          assumptions: string[];
          outcome_note: string | null;
          actual_outcome_binary: boolean | null;
          actual_outcome: string | null;
          calibration_gap: number | null;
          calibration_error: number | null;
          status: "pending" | "resolved";
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          description: string;
          predicted_confidence: number;
          assumptions?: string[];
          outcome_note?: string | null;
          actual_outcome_binary?: boolean | null;
          actual_outcome?: string | null;
          calibration_gap?: number | null;
          calibration_error?: number | null;
          status?: "pending" | "resolved";
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          description?: string;
          predicted_confidence?: number;
          assumptions?: string[];
          outcome_note?: string | null;
          actual_outcome_binary?: boolean | null;
          actual_outcome?: string | null;
          calibration_gap?: number | null;
          calibration_error?: number | null;
          status?: "pending" | "resolved";
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      session_chunks: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          content: string;
          embedding: number[];
          pattern_surfaced: string | null;
          dna_scores: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          content: string;
          embedding?: number[];
          pattern_surfaced?: string | null;
          dna_scores?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          content?: string;
          embedding?: number[];
          pattern_surfaced?: string | null;
          dna_scores?: Json | null;
          created_at?: string;
        };
      };
      daily_cognitive_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          calibration_score: number;
          assumption_load: number;
          belief_update_count: number;
          dominant_bias: string;
          radar_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          snapshot_date: string;
          calibration_score: number;
          assumption_load: number;
          belief_update_count: number;
          dominant_bias: string;
          radar_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          snapshot_date?: string;
          calibration_score?: number;
          assumption_load?: number;
          belief_update_count?: number;
          dominant_bias?: string;
          radar_data?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_research_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: Array<{
          id: string;
          filename: string;
          content: string;
          author: string;
          year: number;
          bias_categories: string[];
          similarity: number;
        }>;
      };
      match_session_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
          p_user_id: string;
        };
        Returns: Array<{
          id: string;
          session_id: string;
          content: string;
          pattern_surfaced: string | null;
          dna_scores: Json | null;
          similarity: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
