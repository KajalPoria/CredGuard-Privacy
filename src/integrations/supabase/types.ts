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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      connected_institutions: {
        Row: {
          connected_at: string
          country: string
          id: string
          institution_name: string
          institution_type: string
          last_access_at: string | null
          status: string
          trust_level: string | null
          user_id: string
          verifications_count: number | null
        }
        Insert: {
          connected_at?: string
          country: string
          id?: string
          institution_name: string
          institution_type: string
          last_access_at?: string | null
          status?: string
          trust_level?: string | null
          user_id: string
          verifications_count?: number | null
        }
        Update: {
          connected_at?: string
          country?: string
          id?: string
          institution_name?: string
          institution_type?: string
          last_access_at?: string | null
          status?: string
          trust_level?: string | null
          user_id?: string
          verifications_count?: number | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          data_types: string[]
          expires_at: string
          granted_at: string
          id: string
          institution_name: string
          purpose: string
          status: string
          user_id: string
        }
        Insert: {
          data_types: string[]
          expires_at: string
          granted_at?: string
          id?: string
          institution_name: string
          purpose: string
          status?: string
          user_id: string
        }
        Update: {
          data_types?: string[]
          expires_at?: string
          granted_at?: string
          id?: string
          institution_name?: string
          purpose?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      encrypted_identities: {
        Row: {
          behavioral_metrics: Json | null
          created_at: string
          cyborgdb_index_id: string | null
          cyborgdb_indexed: boolean | null
          encrypted_vector: string
          id: string
          updated_at: string
          user_id: string
          zk_proof: string | null
        }
        Insert: {
          behavioral_metrics?: Json | null
          created_at?: string
          cyborgdb_index_id?: string | null
          cyborgdb_indexed?: boolean | null
          encrypted_vector: string
          id?: string
          updated_at?: string
          user_id: string
          zk_proof?: string | null
        }
        Update: {
          behavioral_metrics?: Json | null
          created_at?: string
          cyborgdb_index_id?: string | null
          cyborgdb_indexed?: boolean | null
          encrypted_vector?: string
          id?: string
          updated_at?: string
          user_id?: string
          zk_proof?: string | null
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          amount: number
          created_at: string
          cryptographic_proof: string | null
          decision_status: string | null
          eligibility: string | null
          fairness_score: number | null
          fraud_likelihood: number | null
          id: string
          purpose: string | null
          reasoning: string[] | null
          recommended_max: number | null
          recommended_min: number | null
          risk_score: number | null
          status: string
          tenure: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          cryptographic_proof?: string | null
          decision_status?: string | null
          eligibility?: string | null
          fairness_score?: number | null
          fraud_likelihood?: number | null
          id?: string
          purpose?: string | null
          reasoning?: string[] | null
          recommended_max?: number | null
          recommended_min?: number | null
          risk_score?: number | null
          status?: string
          tenure?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          cryptographic_proof?: string | null
          decision_status?: string | null
          eligibility?: string | null
          fairness_score?: number | null
          fraud_likelihood?: number | null
          id?: string
          purpose?: string | null
          reasoning?: string[] | null
          recommended_max?: number | null
          recommended_min?: number | null
          risk_score?: number | null
          status?: string
          tenure?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_history: {
        Row: {
          country: string
          created_at: string
          id: string
          institution_name: string
          score: number | null
          status: string
          user_id: string
          verification_type: string
          zk_proof: string | null
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          institution_name: string
          score?: number | null
          status: string
          user_id: string
          verification_type: string
          zk_proof?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          institution_name?: string
          score?: number | null
          status?: string
          user_id?: string
          verification_type?: string
          zk_proof?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
