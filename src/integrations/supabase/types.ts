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
      audit_log: {
        Row: {
          action: string
          actor_label: string | null
          actor_user_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string | null
          wedding_id: string
        }
        Insert: {
          action: string
          actor_label?: string | null
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
          wedding_id: string
        }
        Update: {
          action?: string
          actor_label?: string | null
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          actual_cost: number | null
          category: string | null
          created_at: string
          estimated_cost: number
          id: string
          name: string
          notes: string | null
          paid_amount: number
          position: number
          updated_at: string
          vendor_contact_name: string | null
          vendor_email: string | null
          vendor_name: string | null
          vendor_notes: string | null
          vendor_phone: string | null
          vendor_website: string | null
          wedding_id: string
        }
        Insert: {
          actual_cost?: number | null
          category?: string | null
          created_at?: string
          estimated_cost?: number
          id?: string
          name: string
          notes?: string | null
          paid_amount?: number
          position?: number
          updated_at?: string
          vendor_contact_name?: string | null
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_notes?: string | null
          vendor_phone?: string | null
          vendor_website?: string | null
          wedding_id: string
        }
        Update: {
          actual_cost?: number | null
          category?: string | null
          created_at?: string
          estimated_cost?: number
          id?: string
          name?: string
          notes?: string | null
          paid_amount?: number
          position?: number
          updated_at?: string
          vendor_contact_name?: string | null
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_notes?: string | null
          vendor_phone?: string | null
          vendor_website?: string | null
          wedding_id?: string
        }
        Relationships: []
      }
      guest_groups: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_groups_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          age_type: Database["public"]["Enums"]["age_type"]
          created_at: string
          email: string | null
          first_name: string
          guest_group_id: string | null
          guest_type: Database["public"]["Enums"]["guest_type"]
          id: string
          invitation_code: string
          last_name: string
          notes: string | null
          plus_one_allowed: boolean
          updated_at: string
          wedding_id: string
        }
        Insert: {
          age_type?: Database["public"]["Enums"]["age_type"]
          created_at?: string
          email?: string | null
          first_name: string
          guest_group_id?: string | null
          guest_type?: Database["public"]["Enums"]["guest_type"]
          id?: string
          invitation_code: string
          last_name: string
          notes?: string | null
          plus_one_allowed?: boolean
          updated_at?: string
          wedding_id: string
        }
        Update: {
          age_type?: Database["public"]["Enums"]["age_type"]
          created_at?: string
          email?: string | null
          first_name?: string
          guest_group_id?: string | null
          guest_type?: Database["public"]["Enums"]["guest_type"]
          id?: string
          invitation_code?: string
          last_name?: string
          notes?: string | null
          plus_one_allowed?: boolean
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_guest_group_id_fkey"
            columns: ["guest_group_id"]
            isOneToOne: false
            referencedRelation: "guest_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_messages: {
        Row: {
          author_name: string
          created_at: string
          guest_id: string | null
          id: string
          message: string
          status: Database["public"]["Enums"]["guestbook_status"]
          updated_at: string
          wedding_id: string
        }
        Insert: {
          author_name: string
          created_at?: string
          guest_id?: string | null
          id?: string
          message: string
          status?: Database["public"]["Enums"]["guestbook_status"]
          updated_at?: string
          wedding_id: string
        }
        Update: {
          author_name?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["guestbook_status"]
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_messages_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guestbook_messages_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          guest_id: string | null
          id: string
          size_bytes: number
          status: Database["public"]["Enums"]["photo_status"]
          storage_path: string
          updated_at: string
          uploader_name: string
          wedding_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          size_bytes?: number
          status?: Database["public"]["Enums"]["photo_status"]
          storage_path: string
          updated_at?: string
          uploader_name: string
          wedding_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          size_bytes?: number
          status?: Database["public"]["Enums"]["photo_status"]
          storage_path?: string
          updated_at?: string
          uploader_name?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_songs: {
        Row: {
          artist: string
          created_at: string
          guest_id: string | null
          id: string
          spotify_url: string | null
          submitted_by_name: string
          title: string
          updated_at: string
          vote_count: number
          wedding_id: string
        }
        Insert: {
          artist: string
          created_at?: string
          guest_id?: string | null
          id?: string
          spotify_url?: string | null
          submitted_by_name: string
          title: string
          updated_at?: string
          vote_count?: number
          wedding_id: string
        }
        Update: {
          artist?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          spotify_url?: string | null
          submitted_by_name?: string
          title?: string
          updated_at?: string
          vote_count?: number
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_songs_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp_responses: {
        Row: {
          attendance: Database["public"]["Enums"]["rsvp_attendance"] | null
          comments: string | null
          created_at: string
          dietary_other: string | null
          dietary_tags: string[]
          edited_by_admin: boolean
          guest_id: string
          id: string
          plus_one_name: string | null
          status: Database["public"]["Enums"]["rsvp_status"]
          updated_at: string
          wedding_id: string
        }
        Insert: {
          attendance?: Database["public"]["Enums"]["rsvp_attendance"] | null
          comments?: string | null
          created_at?: string
          dietary_other?: string | null
          dietary_tags?: string[]
          edited_by_admin?: boolean
          guest_id: string
          id?: string
          plus_one_name?: string | null
          status: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          wedding_id: string
        }
        Update: {
          attendance?: Database["public"]["Enums"]["rsvp_attendance"] | null
          comments?: string | null
          created_at?: string
          dietary_other?: string | null
          dietary_tags?: string[]
          edited_by_admin?: boolean
          guest_id?: string
          id?: string
          plus_one_name?: string | null
          status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvp_responses_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_assignments: {
        Row: {
          created_at: string
          guest_id: string
          id: string
          seat_index: number
          table_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: string
          seat_index: number
          table_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: string
          seat_index?: number
          table_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_assignments_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_assignments_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "seating_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_assignments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_tables: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          seat_count: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          seat_count: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          seat_count?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_tables_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      story_chapters: {
        Row: {
          body: string
          chapter_label: string | null
          created_at: string
          event_date: string | null
          id: string
          illustration_motif: string | null
          position: number
          title: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          body: string
          chapter_label?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          illustration_motif?: string | null
          position?: number
          title: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          body?: string
          chapter_label?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          illustration_motif?: string | null
          position?: number
          title?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_chapters_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_time: string
          id: string
          is_visible: boolean
          location: string | null
          position: number
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["timeline_visibility"]
          wedding_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          event_time: string
          id?: string
          is_visible?: boolean
          location?: string | null
          position?: number
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["timeline_visibility"]
          wedding_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_time?: string
          id?: string
          is_visible?: boolean
          location?: string | null
          position?: number
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["timeline_visibility"]
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_tasks: {
        Row: {
          budget_item_id: string | null
          category: string
          created_at: string
          created_from_template: boolean
          deadline: string | null
          description: string | null
          id: string
          position: number
          priority: Database["public"]["Enums"]["todo_priority"]
          status: Database["public"]["Enums"]["todo_status"]
          template_id: string | null
          title: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          budget_item_id?: string | null
          category?: string
          created_at?: string
          created_from_template?: boolean
          deadline?: string | null
          description?: string | null
          id?: string
          position?: number
          priority?: Database["public"]["Enums"]["todo_priority"]
          status?: Database["public"]["Enums"]["todo_status"]
          template_id?: string | null
          title: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          budget_item_id?: string | null
          category?: string
          created_at?: string
          created_from_template?: boolean
          deadline?: string | null
          description?: string | null
          id?: string
          position?: number
          priority?: Database["public"]["Enums"]["todo_priority"]
          status?: Database["public"]["Enums"]["todo_status"]
          template_id?: string | null
          title?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todo_tasks_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          position: number
          priority: Database["public"]["Enums"]["todo_priority"]
          relative_days_before: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          priority?: Database["public"]["Enums"]["todo_priority"]
          relative_days_before?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          priority?: Database["public"]["Enums"]["todo_priority"]
          relative_days_before?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wedding_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["wedding_role"]
          user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["wedding_role"]
          user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["wedding_role"]
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          bride_name: string | null
          ceremony_at: string | null
          couple_name_one: string | null
          couple_name_two: string | null
          created_at: string
          groom_name: string | null
          id: string
          invitation_content: string | null
          invitation_message: string | null
          invitation_template: string
          invitation_text: string
          invitation_title: string | null
          invitation_visible: boolean
          is_public: boolean
          location_address: string | null
          location_name: string | null
          maps_url: string | null
          primary_admin_id: string
          reception_at: string | null
          rsvp_deadline: string | null
          slug: string
          status: Database["public"]["Enums"]["wedding_status"]
          storage_limit_bytes: number
          updated_at: string
          wedding_date: string | null
          wedding_name: string | null
          wishlist_enabled: boolean
        }
        Insert: {
          bride_name?: string | null
          ceremony_at?: string | null
          couple_name_one?: string | null
          couple_name_two?: string | null
          created_at?: string
          groom_name?: string | null
          id?: string
          invitation_content?: string | null
          invitation_message?: string | null
          invitation_template?: string
          invitation_text?: string
          invitation_title?: string | null
          invitation_visible?: boolean
          is_public?: boolean
          location_address?: string | null
          location_name?: string | null
          maps_url?: string | null
          primary_admin_id: string
          reception_at?: string | null
          rsvp_deadline?: string | null
          slug: string
          status?: Database["public"]["Enums"]["wedding_status"]
          storage_limit_bytes?: number
          updated_at?: string
          wedding_date?: string | null
          wedding_name?: string | null
          wishlist_enabled?: boolean
        }
        Update: {
          bride_name?: string | null
          ceremony_at?: string | null
          couple_name_one?: string | null
          couple_name_two?: string | null
          created_at?: string
          groom_name?: string | null
          id?: string
          invitation_content?: string | null
          invitation_message?: string | null
          invitation_template?: string
          invitation_text?: string
          invitation_title?: string | null
          invitation_visible?: boolean
          is_public?: boolean
          location_address?: string | null
          location_name?: string | null
          maps_url?: string | null
          primary_admin_id?: string
          reception_at?: string | null
          rsvp_deadline?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["wedding_status"]
          storage_limit_bytes?: number
          updated_at?: string
          wedding_date?: string | null
          wedding_name?: string | null
          wishlist_enabled?: boolean
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          position: number
          price_text: string | null
          reserved_at: string | null
          reserved_by_guest_id: string | null
          reserved_by_name: string | null
          title: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          position?: number
          price_text?: string | null
          reserved_at?: string | null
          reserved_by_guest_id?: string | null
          reserved_by_name?: string | null
          title: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          position?: number
          price_text?: string | null
          reserved_at?: string | null
          reserved_by_guest_id?: string | null
          reserved_by_name?: string | null
          title?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_guest_data_retention: { Args: never; Returns: undefined }
      current_guest_wedding_id: { Args: never; Returns: string }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_wedding_role: {
        Args: {
          _role: Database["public"]["Enums"]["wedding_role"]
          _user_id: string
          _wedding_id: string
        }
        Returns: boolean
      }
      is_slug_available: { Args: { _slug: string }; Returns: boolean }
      is_wedding_admin: {
        Args: { _user_id: string; _wedding_id: string }
        Returns: boolean
      }
      seed_todo_tasks_for_wedding: {
        Args: { _wedding_id: string }
        Returns: number
      }
      wedding_storage_used: { Args: { _wedding_id: string }; Returns: number }
    }
    Enums: {
      age_type: "adult" | "child"
      app_role: "platform_owner"
      guest_type: "day" | "evening" | "full_day"
      guestbook_status: "visible" | "hidden"
      photo_status: "pending" | "approved" | "hidden"
      rsvp_attendance: "day" | "evening" | "both"
      rsvp_status: "yes" | "no" | "maybe"
      timeline_visibility: "all" | "day" | "evening"
      todo_priority: "low" | "medium" | "high"
      todo_status: "todo" | "in_progress" | "done"
      wedding_role: "primary_admin" | "secondary_admin"
      wedding_status: "draft" | "published"
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
      age_type: ["adult", "child"],
      app_role: ["platform_owner"],
      guestbook_status: ["visible", "hidden"],
      guest_type: ["day", "evening", "full_day"],
      photo_status: ["pending", "approved", "hidden"],
      rsvp_attendance: ["day", "evening", "both"],
      rsvp_status: ["yes", "no", "maybe"],
      timeline_visibility: ["all", "day", "evening"],
      todo_priority: ["low", "medium", "high"],
      todo_status: ["todo", "in_progress", "done"],
      wedding_role: ["primary_admin", "secondary_admin"],
      wedding_status: ["draft", "published"],
    },
  },
} as const
