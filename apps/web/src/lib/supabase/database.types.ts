export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string;
          encrypted_key_hash: string;
          id: string;
          is_active: boolean | null;
          key_name: string | null;
          last_used_at: string | null;
          provider: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          encrypted_key_hash: string;
          id?: string;
          is_active?: boolean | null;
          key_name?: string | null;
          last_used_at?: string | null;
          provider: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          encrypted_key_hash?: string;
          id?: string;
          is_active?: boolean | null;
          key_name?: string | null;
          last_used_at?: string | null;
          provider?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      component_patterns: {
        Row: {
          avg_quality_score: number | null;
          category: string;
          code: string;
          created_at: string | null;
          description: string;
          embedding: string | null;
          framework: string;
          id: string;
          name: string;
          usage_count: number | null;
        };
        Insert: {
          avg_quality_score?: number | null;
          category: string;
          code: string;
          created_at?: string | null;
          description: string;
          embedding?: string | null;
          framework: string;
          id?: string;
          name: string;
          usage_count?: number | null;
        };
        Update: {
          avg_quality_score?: number | null;
          category?: string;
          code?: string;
          created_at?: string | null;
          description?: string;
          embedding?: string | null;
          framework?: string;
          id?: string;
          name?: string;
          usage_count?: number | null;
        };
        Relationships: [];
      };
      components: {
        Row: {
          code_file_path: string | null;
          component_type: string;
          created_at: string;
          description: string | null;
          embedding: string | null;
          framework: string;
          id: string;
          name: string;
          preview_image_url: string | null;
          project_id: string;
          props: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          code_file_path?: string | null;
          component_type: string;
          created_at?: string;
          description?: string | null;
          embedding?: string | null;
          framework: string;
          id?: string;
          name: string;
          preview_image_url?: string | null;
          project_id: string;
          props?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          code_file_path?: string | null;
          component_type?: string;
          created_at?: string;
          description?: string | null;
          embedding?: string | null;
          framework?: string;
          id?: string;
          name?: string;
          preview_image_url?: string | null;
          project_id?: string;
          props?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'components_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flag_changes: {
        Row: {
          changed_by: string | null;
          created_at: string;
          field: string;
          flag_id: string;
          id: string;
          new_value: string | null;
          old_value: string | null;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          field: string;
          flag_id: string;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          field?: string;
          flag_id?: string;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'feature_flag_changes_flag_id_fkey';
            columns: ['flag_id'];
            isOneToOne: false;
            referencedRelation: 'feature_flags';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flags: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          enabled: boolean;
          enabled_for_users: string[] | null;
          id: string;
          name: string;
          scope: string[];
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          enabled_for_users?: string[] | null;
          id?: string;
          name: string;
          scope?: string[];
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          enabled_for_users?: string[] | null;
          id?: string;
          name?: string;
          scope?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      file_versions: {
        Row: {
          content: string;
          created_at: string;
          created_by: string | null;
          file_path: string;
          id: string;
          project_id: string;
          version_number: number;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by?: string | null;
          file_path: string;
          id?: string;
          project_id: string;
          version_number: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string | null;
          file_path?: string;
          id?: string;
          project_id?: string;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'file_versions_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      generations: {
        Row: {
          ai_provider: string | null;
          component_id: string | null;
          component_library: string | null;
          component_name: string | null;
          component_type: string | null;
          created_at: string;
          error_message: string | null;
          framework: string;
          generated_code: string | null;
          generation_time_ms: number | null;
          id: string;
          model_used: string | null;
          project_id: string | null;
          prompt: string;
          prompt_embedding: string | null;
          quality_score: number | null;
          result_file_path: string | null;
          status: string;
          style: string | null;
          tokens_used: number | null;
          typescript: boolean | null;
          user_feedback: string | null;
          user_id: string;
        };
        Insert: {
          ai_provider?: string | null;
          component_id?: string | null;
          component_library?: string | null;
          component_name?: string | null;
          component_type?: string | null;
          created_at?: string;
          error_message?: string | null;
          framework: string;
          generated_code?: string | null;
          generation_time_ms?: number | null;
          id?: string;
          model_used?: string | null;
          project_id?: string | null;
          prompt: string;
          prompt_embedding?: string | null;
          quality_score?: number | null;
          result_file_path?: string | null;
          status?: string;
          style?: string | null;
          tokens_used?: number | null;
          typescript?: boolean | null;
          user_feedback?: string | null;
          user_id: string;
        };
        Update: {
          ai_provider?: string | null;
          component_id?: string | null;
          component_library?: string | null;
          component_name?: string | null;
          component_type?: string | null;
          created_at?: string;
          error_message?: string | null;
          framework?: string;
          generated_code?: string | null;
          generation_time_ms?: number | null;
          id?: string;
          model_used?: string | null;
          project_id?: string | null;
          prompt?: string;
          prompt_embedding?: string | null;
          quality_score?: number | null;
          result_file_path?: string | null;
          status?: string;
          style?: string | null;
          tokens_used?: number | null;
          typescript?: boolean | null;
          user_feedback?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generations_component_id_fkey';
            columns: ['component_id'];
            isOneToOne: false;
            referencedRelation: 'components';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'generations_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      github_installations: {
        Row: {
          account_login: string;
          account_type: string;
          created_at: string | null;
          id: string;
          installation_id: number;
          permissions: Json | null;
          suspended_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_login: string;
          account_type: string;
          created_at?: string | null;
          id?: string;
          installation_id: number;
          permissions?: Json | null;
          suspended_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_login?: string;
          account_type?: string;
          created_at?: string | null;
          id?: string;
          installation_id?: number;
          permissions?: Json | null;
          suspended_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      github_repos: {
        Row: {
          created_at: string | null;
          default_branch: string | null;
          full_name: string;
          github_repo_id: number;
          id: string;
          installation_id: string | null;
          project_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          default_branch?: string | null;
          full_name: string;
          github_repo_id: number;
          id?: string;
          installation_id?: string | null;
          project_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          default_branch?: string | null;
          full_name?: string;
          github_repo_id?: number;
          id?: string;
          installation_id?: string | null;
          project_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'github_repos_installation_id_fkey';
            columns: ['installation_id'];
            isOneToOne: false;
            referencedRelation: 'github_installations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'github_repos_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_limits: {
        Row: {
          features: Json | null;
          generations_per_month: number;
          id: string;
          max_components_per_project: number;
          max_projects: number;
          plan: string;
        };
        Insert: {
          features?: Json | null;
          generations_per_month: number;
          id?: string;
          max_components_per_project: number;
          max_projects: number;
          plan: string;
        };
        Update: {
          features?: Json | null;
          generations_per_month?: number;
          id?: string;
          max_components_per_project?: number;
          max_projects?: number;
          plan?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          full_name: string | null;
          global_preferences: Json | null;
          id: string;
          project_access: Json | null;
          role: string | null;
          theme: string | null;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          global_preferences?: Json | null;
          id: string;
          project_access?: Json | null;
          role?: string | null;
          theme?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          global_preferences?: Json | null;
          id?: string;
          project_access?: Json | null;
          role?: string | null;
          theme?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      project_permissions: {
        Row: {
          granted_at: string | null;
          granted_by: string | null;
          id: string;
          permissions: string[];
          project_name: string;
          user_id: string;
        };
        Insert: {
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          permissions: string[];
          project_name: string;
          user_id: string;
        };
        Update: {
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          permissions?: string[];
          project_name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          component_library: string | null;
          created_at: string;
          description: string | null;
          framework: string;
          id: string;
          is_public: boolean | null;
          is_template: boolean | null;
          name: string;
          thumbnail_url: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          component_library?: string | null;
          created_at?: string;
          description?: string | null;
          framework?: string;
          id?: string;
          is_public?: boolean | null;
          is_template?: boolean | null;
          name: string;
          thumbnail_url?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          component_library?: string | null;
          created_at?: string;
          description?: string | null;
          framework?: string;
          id?: string;
          is_public?: boolean | null;
          is_template?: boolean | null;
          name?: string;
          thumbnail_url?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      shared_logs: {
        Row: {
          context: Json | null;
          correlation_id: string | null;
          created_at: string | null;
          environment: string;
          id: string;
          level: string;
          message: string;
          request_id: string | null;
          service_name: string;
          service_version: string | null;
          session_id: string | null;
          span_id: string | null;
          tags: Json | null;
          timestamp: string | null;
          trace_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          context?: Json | null;
          correlation_id?: string | null;
          created_at?: string | null;
          environment: string;
          id?: string;
          level: string;
          message: string;
          request_id?: string | null;
          service_name: string;
          service_version?: string | null;
          session_id?: string | null;
          span_id?: string | null;
          tags?: Json | null;
          timestamp?: string | null;
          trace_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          context?: Json | null;
          correlation_id?: string | null;
          created_at?: string | null;
          environment?: string;
          id?: string;
          level?: string;
          message?: string;
          request_id?: string | null;
          service_name?: string;
          service_version?: string | null;
          session_id?: string | null;
          span_id?: string | null;
          tags?: Json | null;
          timestamp?: string | null;
          trace_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      stripe_events: {
        Row: {
          created_at: string;
          id: string;
          payload: Json | null;
          processed: boolean;
          type: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          payload?: Json | null;
          processed?: boolean;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payload?: Json | null;
          processed?: boolean;
          type?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          category: string;
          code: Json;
          created_at: string;
          created_by: string | null;
          description: string | null;
          framework: string;
          id: string;
          is_official: boolean | null;
          name: string;
          thumbnail_url: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          code: Json;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          framework: string;
          id?: string;
          is_official?: boolean | null;
          name: string;
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          code?: Json;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          framework?: string;
          id?: string;
          is_official?: boolean | null;
          name?: string;
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_tracking: {
        Row: {
          billing_period_end: string;
          billing_period_start: string;
          created_at: string;
          generations_count: number;
          generations_limit: number;
          id: string;
          projects_count: number;
          projects_limit: number;
          tokens_used: number;
          user_id: string;
        };
        Insert: {
          billing_period_end: string;
          billing_period_start: string;
          created_at?: string;
          generations_count?: number;
          generations_limit?: number;
          id?: string;
          projects_count?: number;
          projects_limit?: number;
          tokens_used?: number;
          user_id: string;
        };
        Update: {
          billing_period_end?: string;
          billing_period_start?: string;
          created_at?: string;
          generations_count?: number;
          generations_limit?: number;
          id?: string;
          projects_count?: number;
          projects_limit?: number;
          tokens_used?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      user_provider_tokens: {
        Row: {
          access_token: string;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          provider: string;
          refresh_token: string | null;
          scopes: string[] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          provider: string;
          refresh_token?: string | null;
          scopes?: string[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          provider?: string;
          refresh_token?: string | null;
          scopes?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_orphaned_files: { Args: never; Returns: number };
      get_user_component_count: { Args: { user_uuid: string }; Returns: number };
      get_user_generation_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_user_project_count: { Args: { user_uuid: string }; Returns: number };
      get_user_storage_usage: { Args: { user_uuid: string }; Returns: number };
      match_generations: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          min_quality?: number;
          query_embedding: string;
        };
        Returns: {
          framework: string;
          generated_code: string;
          id: string;
          prompt: string;
          quality_score: number;
          similarity: number;
        }[];
      };
      match_patterns: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          category: string;
          code: string;
          description: string;
          framework: string;
          id: string;
          name: string;
          similarity: number;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
