// Database types will be generated here via: supabase gen types typescript
// This file is a placeholder until we run the type generation command

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          theme: 'light' | 'dark' | 'system';
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          theme?: 'light' | 'dark' | 'system';
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          theme?: 'light' | 'dark' | 'system';
        };
      };
      projects: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          description: string | null;
          thumbnail_url: string | null;
          framework: 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte' | 'html';
          component_library: 'none' | 'shadcn' | 'radix' | 'material' | 'chakra' | 'ant';
          is_template: boolean;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          description?: string | null;
          thumbnail_url?: string | null;
          framework?: 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte' | 'html';
          component_library?: 'none' | 'shadcn' | 'radix' | 'material' | 'chakra' | 'ant';
          is_template?: boolean;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          framework?: 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte' | 'html';
          component_library?: 'none' | 'shadcn' | 'radix' | 'material' | 'chakra' | 'ant';
          is_template?: boolean;
          is_public?: boolean;
        };
      };
      components: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          project_id: string;
          user_id: string;
          name: string;
          description: string | null;
          component_type:
            | 'button'
            | 'card'
            | 'form'
            | 'input'
            | 'modal'
            | 'navbar'
            | 'sidebar'
            | 'table'
            | 'custom';
          code_file_path: string | null;
          preview_image_url: string | null;
          framework: string;
          props: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          project_id: string;
          user_id: string;
          name: string;
          description?: string | null;
          component_type:
            | 'button'
            | 'card'
            | 'form'
            | 'input'
            | 'modal'
            | 'navbar'
            | 'sidebar'
            | 'table'
            | 'custom';
          code_file_path?: string | null;
          preview_image_url?: string | null;
          framework: string;
          props?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          project_id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          component_type?:
            | 'button'
            | 'card'
            | 'form'
            | 'input'
            | 'modal'
            | 'navbar'
            | 'sidebar'
            | 'table'
            | 'custom';
          code_file_path?: string | null;
          preview_image_url?: string | null;
          framework?: string;
          props?: Json;
        };
      };
      generations: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          project_id: string | null;
          component_id: string | null;
          prompt: string;
          framework: string;
          component_type: string | null;
          ai_provider: 'openai' | 'anthropic' | 'google' | 'gemini-fallback' | null;
          model_used: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_file_path: string | null;
          error_message: string | null;
          tokens_used: number | null;
          generation_time_ms: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          project_id?: string | null;
          component_id?: string | null;
          prompt: string;
          framework: string;
          component_type?: string | null;
          ai_provider?: 'openai' | 'anthropic' | 'google' | 'gemini-fallback' | null;
          model_used?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          result_file_path?: string | null;
          error_message?: string | null;
          tokens_used?: number | null;
          generation_time_ms?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          project_id?: string | null;
          component_id?: string | null;
          prompt?: string;
          framework?: string;
          component_type?: string | null;
          ai_provider?: 'openai' | 'anthropic' | 'google' | 'gemini-fallback' | null;
          model_used?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          result_file_path?: string | null;
          error_message?: string | null;
          tokens_used?: number | null;
          generation_time_ms?: number | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          provider: 'openai' | 'anthropic' | 'google';
          encrypted_key_hash: string;
          key_name: string | null;
          last_used_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          provider: 'openai' | 'anthropic' | 'google';
          encrypted_key_hash: string;
          key_name?: string | null;
          last_used_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          provider?: 'openai' | 'anthropic' | 'google';
          encrypted_key_hash?: string;
          key_name?: string | null;
          last_used_at?: string | null;
          is_active?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_project_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_user_component_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_user_generation_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_user_storage_usage: {
        Args: { user_uuid: string };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
