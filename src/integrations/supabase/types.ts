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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          title: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          role: 'founder' | 'developer' | 'designer' | 'marketer' | 'product_manager' | 'investor' | 'mentor' | 'other' | null
          skills: string[] | null
          looking_for: ('co_founder' | 'developer' | 'designer' | 'mentor' | 'investor' | 'advisor' | 'team_member' | 'collaborator')[] | null
          preferred_industries: string[] | null
          preferred_project_types: string[] | null
          experience_level: string | null
          project_stage: string | null
          availability: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          title?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          role?: 'founder' | 'developer' | 'designer' | 'marketer' | 'product_manager' | 'investor' | 'mentor' | 'other' | null
          skills?: string[] | null
          looking_for?: ('co_founder' | 'developer' | 'designer' | 'mentor' | 'investor' | 'advisor' | 'team_member' | 'collaborator')[] | null
          preferred_industries?: string[] | null
          preferred_project_types?: string[] | null
          experience_level?: string | null
          project_stage?: string | null
          availability?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          title?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          role?: 'founder' | 'developer' | 'designer' | 'marketer' | 'product_manager' | 'investor' | 'mentor' | 'other' | null
          skills?: string[] | null
          looking_for?: ('co_founder' | 'developer' | 'designer' | 'mentor' | 'investor' | 'advisor' | 'team_member' | 'collaborator')[] | null
          preferred_industries?: string[] | null
          preferred_project_types?: string[] | null
          experience_level?: string | null
          project_stage?: string | null
          availability?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          recipient_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          recipient_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          recipient_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          project_id: string
          member_id: string
          role: string
          joined_at: string
        }
        Insert: {
          project_id: string
          member_id: string
          role: string
          joined_at?: string
        }
        Update: {
          project_id?: string
          member_id?: string
          role?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
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
      user_role: 'founder' | 'developer' | 'designer' | 'marketer' | 'product_manager' | 'investor' | 'mentor' | 'other'
      looking_for_type: 'co_founder' | 'developer' | 'designer' | 'mentor' | 'investor' | 'advisor' | 'team_member' | 'collaborator'
      connection_status: 'pending' | 'accepted' | 'rejected'
      project_status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
