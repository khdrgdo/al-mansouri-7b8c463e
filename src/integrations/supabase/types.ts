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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          admin_notes: string | null
          advertiser_name: string
          category_id: string | null
          category_slug: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          location_text: string | null
          phone: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          advertiser_name: string
          category_id?: string | null
          category_slug?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          location_text?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          advertiser_name?: string
          category_id?: string | null
          category_slug?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          location_text?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_items: {
        Row: {
          alt_text: string | null
          caption: string | null
          category_id: string | null
          contributor: string | null
          created_at: string
          description: string | null
          file_name: string | null
          id: string
          item_date: string | null
          location_id: string | null
          media_type: string
          media_url: string | null
          published: boolean
          slug: string
          source: string | null
          title: string
          updated_at: string
          verification: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          category_id?: string | null
          contributor?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          id?: string
          item_date?: string | null
          location_id?: string | null
          media_type?: string
          media_url?: string | null
          published?: boolean
          slug: string
          source?: string | null
          title: string
          updated_at?: string
          verification?: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          category_id?: string | null
          contributor?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          id?: string
          item_date?: string | null
          location_id?: string | null
          media_type?: string
          media_url?: string | null
          published?: boolean
          slug?: string
          source?: string | null
          title?: string
          updated_at?: string
          verification?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_people: {
        Row: {
          archive_id: string
          person_id: string
        }
        Insert: {
          archive_id: string
          person_id: string
        }
        Update: {
          archive_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_people_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archive_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      article_events: {
        Row: {
          article_id: string
          event_id: string
        }
        Insert: {
          article_id: string
          event_id: string
        }
        Update: {
          article_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_events_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "historical_events"
            referencedColumns: ["id"]
          },
        ]
      }
      article_locations: {
        Row: {
          article_id: string
          location_id: string
        }
        Insert: {
          article_id: string
          location_id: string
        }
        Update: {
          article_id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_locations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      article_people: {
        Row: {
          article_id: string
          person_id: string
        }
        Insert: {
          article_id: string
          person_id: string
        }
        Update: {
          article_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_people_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          category_id: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sources: string | null
          title: string
          updated_at: string
          verification: string
        }
        Insert: {
          author?: string | null
          category_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sources?: string | null
          title: string
          updated_at?: string
          verification?: string
        }
        Update: {
          author?: string | null
          category_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sources?: string | null
          title?: string
          updated_at?: string
          verification?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_client: string | null
          actor_email: string | null
          actor_id: string | null
          content_id: string | null
          content_type: string | null
          created_at: string
          error_message: string | null
          id: string
          new_values: Json | null
          previous_values: Json | null
          result: string
          source: string
          tool_name: string
        }
        Insert: {
          action: string
          actor_client?: string | null
          actor_email?: string | null
          actor_id?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          result?: string
          source?: string
          tool_name: string
        }
        Update: {
          action?: string
          actor_client?: string | null
          actor_email?: string | null
          actor_id?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          result?: string
          source?: string
          tool_name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          meta: Json
          parent_id: string | null
          reported: boolean
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          meta?: Json
          parent_id?: string | null
          reported?: boolean
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          meta?: Json
          parent_id?: string | null
          reported?: boolean
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          published: boolean
          source: string | null
          title: string
          updated_at: string
          verification: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          published?: boolean
          source?: string | null
          title: string
          updated_at?: string
          verification?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          published?: boolean
          source?: string | null
          title?: string
          updated_at?: string
          verification?: string
        }
        Relationships: []
      }
      event_documents: {
        Row: {
          document_id: string
          event_id: string
        }
        Insert: {
          document_id: string
          event_id: string
        }
        Update: {
          document_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "historical_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_locations: {
        Row: {
          event_id: string
          location_id: string
        }
        Insert: {
          event_id: string
          location_id: string
        }
        Update: {
          event_id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "historical_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_people: {
        Row: {
          event_id: string
          person_id: string
        }
        Insert: {
          event_id: string
          person_id: string
        }
        Update: {
          event_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_people_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "historical_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          images: Json
          period: string | null
          published: boolean
          references_text: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          sources: string | null
          summary: string | null
          title: string
          updated_at: string
          verification: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          images?: Json
          period?: string | null
          published?: boolean
          references_text?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          sources?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          verification?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          images?: Json
          period?: string | null
          published?: boolean
          references_text?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          sources?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          verification?: string
        }
        Relationships: []
      }
      location_periods: {
        Row: {
          created_at: string
          description: string | null
          from_year: number
          id: string
          label: string
          location_id: string
          published: boolean
          sort_order: number
          sources: string | null
          to_year: number | null
          updated_at: string
          verification: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          from_year: number
          id?: string
          label: string
          location_id: string
          published?: boolean
          sort_order?: number
          sources?: string | null
          to_year?: number | null
          updated_at?: string
          verification?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          from_year?: number
          id?: string
          label?: string
          location_id?: string
          published?: boolean
          sort_order?: number
          sources?: string | null
          to_year?: number | null
          updated_at?: string
          verification?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_periods_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          history: string | null
          id: string
          images: Json
          kind: string
          latitude: number | null
          longitude: number | null
          name: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sources: string | null
          updated_at: string
          verification: string
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          history?: string | null
          id?: string
          images?: Json
          kind?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sources?: string | null
          updated_at?: string
          verification?: string
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          history?: string | null
          id?: string
          images?: Json
          kind?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sources?: string | null
          updated_at?: string
          verification?: string
        }
        Relationships: []
      }
      mcp_capabilities: {
        Row: {
          enabled: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          biography: string | null
          birth_info: string | null
          contribution: string | null
          created_at: string
          death_info: string | null
          id: string
          location_id: string | null
          name: string
          photo_url: string | null
          published: boolean
          role_title: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sources: string | null
          updated_at: string
          verification: string
        }
        Insert: {
          biography?: string | null
          birth_info?: string | null
          contribution?: string | null
          created_at?: string
          death_info?: string | null
          id?: string
          location_id?: string | null
          name: string
          photo_url?: string | null
          published?: boolean
          role_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sources?: string | null
          updated_at?: string
          verification?: string
        }
        Update: {
          biography?: string | null
          birth_info?: string | null
          contribution?: string | null
          created_at?: string
          death_info?: string | null
          id?: string
          location_id?: string | null
          name?: string
          photo_url?: string | null
          published?: boolean
          role_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sources?: string | null
          updated_at?: string
          verification?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      publish_batches: {
        Row: {
          actor_client: string | null
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          items: Json
          rolled_back_at: string | null
          skipped: Json
          tool_name: string
        }
        Insert: {
          actor_client?: string | null
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          items?: Json
          rolled_back_at?: string | null
          skipped?: Json
          tool_name?: string
        }
        Update: {
          actor_client?: string | null
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          items?: Json
          rolled_back_at?: string | null
          skipped?: Json
          tool_name?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_notes: string | null
          approx_date: string | null
          contact: string | null
          content_type: string
          contributor_name: string
          created_at: string
          description: string | null
          files: Json
          id: string
          location_text: string | null
          source_context: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approx_date?: string | null
          contact?: string | null
          content_type: string
          contributor_name: string
          created_at?: string
          description?: string | null
          files?: Json
          id?: string
          location_text?: string | null
          source_context?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approx_date?: string | null
          contact?: string | null
          content_type?: string
          contributor_name?: string
          created_at?: string
          description?: string | null
          files?: Json
          id?: string
          location_text?: string | null
          source_context?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
