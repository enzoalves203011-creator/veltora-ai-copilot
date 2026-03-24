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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string
          description: string
          estimated_value: number | null
          id: string
          priority: Database["public"]["Enums"]["insight_priority"]
          recommended_action: string | null
          status: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string
          description: string
          estimated_value?: number | null
          id?: string
          priority?: Database["public"]["Enums"]["insight_priority"]
          recommended_action?: string | null
          status?: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string
          description?: string
          estimated_value?: number | null
          id?: string
          priority?: Database["public"]["Enums"]["insight_priority"]
          recommended_action?: string | null
          status?: string | null
          title?: string
          type?: Database["public"]["Enums"]["insight_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          average_purchase_frequency_days: number | null
          city: string | null
          company_id: string
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          last_purchase_date: string | null
          last_visit_date: string | null
          notes: string | null
          owner_user_id: string | null
          phone: string | null
          potential_value: number | null
          region_id: string | null
          segment_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          average_purchase_frequency_days?: number | null
          city?: string | null
          company_id: string
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_purchase_date?: string | null
          last_visit_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          potential_value?: number | null
          region_id?: string | null
          segment_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          average_purchase_frequency_days?: number | null
          city?: string | null
          company_id?: string
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_purchase_date?: string | null
          last_visit_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          potential_value?: number | null
          region_id?: string | null
          segment_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          region: string | null
          segment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region?: string | null
          segment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region?: string | null
          segment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          client_id: string
          company_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          company_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          estimated_value: number | null
          id: string
          justification: string
          priority: Database["public"]["Enums"]["insight_priority"]
          recommended_action: string
          status: string | null
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          justification: string
          priority?: Database["public"]["Enums"]["insight_priority"]
          recommended_action: string
          status?: string | null
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          justification?: string
          priority?: Database["public"]["Enums"]["insight_priority"]
          recommended_action?: string
          status?: string | null
          type?: Database["public"]["Enums"]["opportunity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          company_id: string
          cost: number
          created_at: string
          default_margin: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sku: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          company_id: string
          cost?: number
          created_at?: string
          default_margin?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          sku?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          company_id?: string
          cost?: number
          created_at?: string
          default_margin?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          cost_price: number
          created_at: string
          id: string
          margin_value: number | null
          product_id: string
          quantity: number
          sale_id: string
          total_price: number | null
          unit_price: number
        }
        Insert: {
          cost_price?: number
          created_at?: string
          id?: string
          margin_value?: number | null
          product_id: string
          quantity?: number
          sale_id: string
          total_price?: number | null
          unit_price?: number
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: string
          margin_value?: number | null
          product_id?: string
          quantity?: number
          sale_id?: string
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          id: string
          margin_value: number
          notes: string | null
          sale_date: string
          seller_user_id: string | null
          status: Database["public"]["Enums"]["sale_status"]
          total_value: number
          updated_at: string
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          id?: string
          margin_value?: number
          notes?: string | null
          sale_date?: string
          seller_user_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          total_value?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          id?: string
          margin_value?: number
          notes?: string | null
          sale_date?: string
          seller_user_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          company_id: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          client_id: string
          company_id: string
          completed_date: string | null
          created_at: string
          id: string
          next_action: string | null
          next_visit_date: string | null
          notes: string | null
          purpose: string | null
          scheduled_date: string
          seller_user_id: string | null
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          company_id: string
          completed_date?: string | null
          created_at?: string
          id?: string
          next_action?: string | null
          next_visit_date?: string | null
          notes?: string | null
          purpose?: string | null
          scheduled_date: string
          seller_user_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_id?: string
          completed_date?: string | null
          created_at?: string
          id?: string
          next_action?: string | null
          next_visit_date?: string | null
          notes?: string | null
          purpose?: string | null
          scheduled_date?: string
          seller_user_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      client_status: "active" | "warm" | "risk" | "inactive"
      insight_priority: "high" | "medium" | "low"
      insight_type: "risk" | "opportunity" | "behavior" | "recommendation"
      opportunity_type:
        | "churn_risk"
        | "repurchase"
        | "mix_increase"
        | "no_visit"
        | "ticket_drop"
        | "underexplored"
        | "reactivation"
      sale_status: "draft" | "confirmed" | "cancelled"
      visit_status: "scheduled" | "completed" | "rescheduled" | "cancelled"
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
      client_status: ["active", "warm", "risk", "inactive"],
      insight_priority: ["high", "medium", "low"],
      insight_type: ["risk", "opportunity", "behavior", "recommendation"],
      opportunity_type: [
        "churn_risk",
        "repurchase",
        "mix_increase",
        "no_visit",
        "ticket_drop",
        "underexplored",
        "reactivation",
      ],
      sale_status: ["draft", "confirmed", "cancelled"],
      visit_status: ["scheduled", "completed", "rescheduled", "cancelled"],
    },
  },
} as const
