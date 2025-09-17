export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          code: string | null
          final_feedback: string | null
          idx: number
          question_id: string
          quick_feedback: string | null
          raw_text: string | null
          score: number | null
          session_id: string
          solution_snapshot: string | null
          submitted_at: string | null
          test_results: Json | null
        }
        Insert: {
          code?: string | null
          final_feedback?: string | null
          idx: number
          question_id: string
          quick_feedback?: string | null
          raw_text?: string | null
          score?: number | null
          session_id: string
          solution_snapshot?: string | null
          submitted_at?: string | null
          test_results?: Json | null
        }
        Update: {
          code?: string | null
          final_feedback?: string | null
          idx?: number
          question_id?: string
          quick_feedback?: string | null
          raw_text?: string | null
          score?: number | null
          session_id?: string
          solution_snapshot?: string | null
          submitted_at?: string | null
          test_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          category: Database["public"]["Enums"]["app_category"]
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_answer: string | null
          language: string | null
          prompt: string
          qtype: Database["public"]["Enums"]["question_type"]
          question_id: number
          signature: string | null
          source: string | null
          tests: Json | null
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["app_category"]
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_answer?: string | null
          language?: string | null
          prompt: string
          qtype: Database["public"]["Enums"]["question_type"]
          question_id?: number
          signature?: string | null
          source?: string | null
          tests?: Json | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["app_category"]
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          expected_answer?: string | null
          language?: string | null
          prompt?: string
          qtype?: Database["public"]["Enums"]["question_type"]
          question_id?: number
          signature?: string | null
          source?: string | null
          tests?: Json | null
          title?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          completed_at: string | null
          duration_min: number | null
          grade: string | null
          session_id: string
          summary: Json | null
          total_score: number | null
        }
        Insert: {
          completed_at?: string | null
          duration_min?: number | null
          grade?: string | null
          session_id: string
          summary?: Json | null
          total_score?: number | null
        }
        Update: {
          completed_at?: string | null
          duration_min?: number | null
          grade?: string | null
          session_id?: string
          summary?: Json | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_index: number
          id: string
          question_ids: string[]
          settings: Json
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_index?: number
          id?: string
          question_ids: string[]
          settings: Json
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_index?: number
          id?: string
          question_ids?: string[]
          settings?: Json
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_questions_for_session: {
        Args: {
          p_category?: Database["public"]["Enums"]["app_category"]
          p_difficulty: Database["public"]["Enums"]["difficulty_level"]
          p_limit?: number
        }
        Returns: {
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          language: string
          prompt: string
          qtype: Database["public"]["Enums"]["question_type"]
          question_id: number
          signature: string
          tests: Json
          title: string
        }[]
      }
      get_session_question: {
        Args: { p_question_id: number; p_session_id: string }
        Returns: {
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_answer: string
          language: string
          prompt: string
          qtype: Database["public"]["Enums"]["question_type"]
          question_id: number
          signature: string
          tests: Json
          title: string
        }[]
      }
      pick_questions: {
        Args:
          | {
              p_category?: Database["public"]["Enums"]["app_category"]
              p_difficulty: Database["public"]["Enums"]["difficulty_level"]
              p_limit?: number
            }
          | {
              p_difficulty: Database["public"]["Enums"]["difficulty_level"]
              p_limit: number
            }
          | {
              p_difficulty: Database["public"]["Enums"]["difficulty_t"]
              p_limit: number
            }
        Returns: {
          question_id: number
        }[]
      }
    }
    Enums: {
      app_category:
        | "software_engineering"
        | "frontend_ui"
        | "ai_ml"
        | "cloud_devops"
        | "database_data"
        | "it_systems"
        | "security_cyber"
      difficulty_level: "Easy" | "Medium" | "Hard"
      difficulty_t: "Easy" | "Medium" | "Hard"
      qtype_t: "Coding" | "Concept" | "Behavioral"
      question_type:
        | "Coding"
        | "Behavioral"
        | "Theory"
        | "System Design"
        | "Technical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_category: [
        "software_engineering",
        "frontend_ui",
        "ai_ml",
        "cloud_devops",
        "database_data",
        "it_systems",
        "security_cyber",
      ],
      difficulty_level: ["Easy", "Medium", "Hard"],
      difficulty_t: ["Easy", "Medium", "Hard"],
      qtype_t: ["Coding", "Concept", "Behavioral"],
      question_type: [
        "Coding",
        "Behavioral",
        "Theory",
        "System Design",
        "Technical",
      ],
    },
  },
} as const
