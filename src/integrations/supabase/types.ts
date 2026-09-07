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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          incident_id: string | null
          severity: string
          status: string
          team: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incident_id?: string | null
          severity?: string
          status?: string
          team?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incident_id?: string | null
          severity?: string
          status?: string
          team?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_by: string | null
          id: string
          level: string
          message: string
          source: string
          timestamp: string
          trace_id: string | null
        }
        Insert: {
          created_by?: string | null
          id?: string
          level?: string
          message: string
          source: string
          timestamp?: string
          trace_id?: string | null
        }
        Update: {
          created_by?: string | null
          id?: string
          level?: string
          message?: string
          source?: string
          timestamp?: string
          trace_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      runbooks: {
        Row: {
          auto_assign_team: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          severity_trigger: string | null
          steps: Json
          title: string
          updated_at: string
        }
        Insert: {
          auto_assign_team?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          severity_trigger?: string | null
          steps?: Json
          title: string
          updated_at?: string
        }
        Update: {
          auto_assign_team?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          severity_trigger?: string | null
          steps?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runbooks_auto_assign_team_fkey"
            columns: ["auto_assign_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_history: {
        Row: {
          id: string
          recorded_at: string
          sla_target_id: string
          uptime: number
        }
        Insert: {
          id?: string
          recorded_at?: string
          sla_target_id: string
          uptime: number
        }
        Update: {
          id?: string
          recorded_at?: string
          sla_target_id?: string
          uptime?: number
        }
        Relationships: [
          {
            foreignKeyName: "sla_history_sla_target_id_fkey"
            columns: ["sla_target_id"]
            isOneToOne: false
            referencedRelation: "sla_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_targets: {
        Row: {
          created_at: string
          created_by: string | null
          current_uptime: number
          id: string
          response_time_target_ms: number
          service_name: string
          status: string
          target_uptime: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_uptime?: number
          id?: string
          response_time_target_ms?: number
          service_name: string
          status?: string
          target_uptime?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_uptime?: number
          id?: string
          response_time_target_ms?: number
          service_name?: string
          status?: string
          target_uptime?: number
          updated_at?: string
        }
        Relationships: []
      }
      status_updates: {
        Row: {
          created_at: string
          id: string
          status: string
          system_name: string
          updated_at: string
          updated_by: string | null
          uptime: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          system_name: string
          updated_at?: string
          updated_by?: string | null
          uptime?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          system_name?: string
          updated_at?: string
          updated_by?: string | null
          uptime?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          on_call_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          on_call_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          on_call_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          created_at: string
          created_by: string | null
          id: string
          priority: string
          status: string
          tags: string[] | null
          team: string | null
          ticket_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          team?: string | null
          ticket_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          team?: string | null
          ticket_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
