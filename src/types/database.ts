export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cifras: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          artist: string
          content: string
          tom: string | null
          capo: number | null
          user_id: string
          is_public: boolean
          category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          artist: string
          content: string
          tom?: string | null
          capo?: number | null
          user_id: string
          is_public?: boolean
          category?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          artist?: string
          content?: string
          tom?: string | null
          capo?: number | null
          user_id?: string
          is_public?: boolean
          category?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
      }
      setlists: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          user_id?: string
        }
      }
      setlist_cifras: {
        Row: {
          id: string
          setlist_id: string
          cifra_id: string
          order: number
          custom_tom: string | null
        }
        Insert: {
          id?: string
          setlist_id: string
          cifra_id: string
          order: number
          custom_tom?: string | null
        }
        Update: {
          id?: string
          setlist_id?: string
          cifra_id?: string
          order?: number
          custom_tom?: string | null
        }
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
  }
}
