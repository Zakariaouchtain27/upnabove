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
      applications: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          motivation_letter_url: string | null
          motivation_text: string | null
          resume_url: string
          status: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          motivation_letter_url?: string | null
          motivation_text?: string | null
          resume_url: string
          status?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          motivation_letter_url?: string | null
          motivation_text?: string | null
          resume_url?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_skills: {
        Row: {
          candidate_id: string
          skill_id: string
        }
        Insert: {
          candidate_id: string
          skill_id: string
        }
        Update: {
          candidate_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bonus_votes: number | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string
          forge_replay_active: boolean | null
          github_url: string | null
          id: string
          is_banned: boolean | null
          is_public: boolean | null
          last_name: string
          linkedin_url: string | null
          ls_subscription_id: string | null
          ls_subscription_status: string | null
          referral_code: string | null
          resume_url: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bonus_votes?: number | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name: string
          forge_replay_active?: boolean | null
          github_url?: string | null
          id: string
          is_banned?: boolean | null
          is_public?: boolean | null
          last_name: string
          linkedin_url?: string | null
          ls_subscription_id?: string | null
          ls_subscription_status?: string | null
          referral_code?: string | null
          resume_url?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bonus_votes?: number | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          forge_replay_active?: boolean | null
          github_url?: string | null
          id?: string
          is_banned?: boolean | null
          is_public?: boolean | null
          last_name?: string
          linkedin_url?: string | null
          ls_subscription_id?: string | null
          ls_subscription_status?: string | null
          referral_code?: string | null
          resume_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employers: {
        Row: {
          challenges_posted: number | null
          company_logo_url: string | null
          company_name: string
          contact_email: string
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          is_banned: boolean | null
          is_verified: boolean | null
          ls_subscription_id: string | null
          ls_subscription_status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          challenges_posted?: number | null
          company_logo_url?: string | null
          company_name: string
          contact_email: string
          created_at?: string | null
          description?: string | null
          id: string
          industry?: string | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          ls_subscription_id?: string | null
          ls_subscription_status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          challenges_posted?: number | null
          company_logo_url?: string | null
          company_name?: string
          contact_email?: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          ls_subscription_id?: string | null
          ls_subscription_status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      forge_badges: {
        Row: {
          badge_type: string
          candidate_id: string | null
          challenge_id: string | null
          earned_at: string | null
          id: string
        }
        Insert: {
          badge_type: string
          candidate_id?: string | null
          challenge_id?: string | null
          earned_at?: string | null
          id?: string
        }
        Update: {
          badge_type?: string
          candidate_id?: string | null
          challenge_id?: string | null
          earned_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forge_badges_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_badges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "forge_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_challenges: {
        Row: {
          ai_weight: number | null
          challenge_type: string
          checkout_url: string | null
          created_at: string | null
          description: string
          difficulty: string
          drop_time: string
          employer_id: string | null
          entry_count: number | null
          expires_at: string
          id: string
          is_public: boolean | null
          is_sponsored: boolean | null
          ls_order_id: string | null
          max_participants: number | null
          payment_status: string | null
          prize_description: string
          prize_value: number | null
          sponsor_name: string | null
          status: string
          time_limit_minutes: number
          title: string
          updated_at: string | null
          vote_weight: number | null
        }
        Insert: {
          ai_weight?: number | null
          challenge_type: string
          checkout_url?: string | null
          created_at?: string | null
          description: string
          difficulty: string
          drop_time: string
          employer_id?: string | null
          entry_count?: number | null
          expires_at: string
          id?: string
          is_public?: boolean | null
          is_sponsored?: boolean | null
          ls_order_id?: string | null
          max_participants?: number | null
          payment_status?: string | null
          prize_description: string
          prize_value?: number | null
          sponsor_name?: string | null
          status: string
          time_limit_minutes: number
          title: string
          updated_at?: string | null
          vote_weight?: number | null
        }
        Update: {
          ai_weight?: number | null
          challenge_type?: string
          checkout_url?: string | null
          created_at?: string | null
          description?: string
          difficulty?: string
          drop_time?: string
          employer_id?: string | null
          entry_count?: number | null
          expires_at?: string
          id?: string
          is_public?: boolean | null
          is_sponsored?: boolean | null
          ls_order_id?: string | null
          max_participants?: number | null
          payment_status?: string | null
          prize_description?: string
          prize_value?: number | null
          sponsor_name?: string | null
          status?: string
          time_limit_minutes?: number
          title?: string
          updated_at?: string | null
          vote_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_challenges_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_comment_votes: {
        Row: {
          candidate_id: string | null
          comment_id: string | null
          created_at: string | null
          id: string
          vote: number
        }
        Insert: {
          candidate_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          vote: number
        }
        Update: {
          candidate_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          vote?: number
        }
        Relationships: [
          {
            foreignKeyName: "forge_comment_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forge_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_comments: {
        Row: {
          body: string
          candidate_id: string | null
          created_at: string | null
          downvotes: number | null
          entry_id: string | null
          id: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          body: string
          candidate_id?: string | null
          created_at?: string | null
          downvotes?: number | null
          entry_id?: string | null
          id?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          body?: string
          candidate_id?: string | null
          created_at?: string | null
          downvotes?: number | null
          entry_id?: string | null
          id?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_comments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_comments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "forge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_comments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "public_forge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_entries: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          candidate_id: string | null
          challenge_id: string | null
          codename: string
          entered_at: string | null
          final_score: number | null
          fraud_score: number | null
          id: string
          is_flagged: boolean | null
          is_revealed: boolean | null
          rank: number | null
          revealed_at: string | null
          squad_id: string | null
          status: string
          submission_file_url: string | null
          submission_text: string | null
          submission_url: string | null
          vote_count: number | null
          vote_score: number | null
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          candidate_id?: string | null
          challenge_id?: string | null
          codename: string
          entered_at?: string | null
          final_score?: number | null
          fraud_score?: number | null
          id?: string
          is_flagged?: boolean | null
          is_revealed?: boolean | null
          rank?: number | null
          revealed_at?: string | null
          squad_id?: string | null
          status: string
          submission_file_url?: string | null
          submission_text?: string | null
          submission_url?: string | null
          vote_count?: number | null
          vote_score?: number | null
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          candidate_id?: string | null
          challenge_id?: string | null
          codename?: string
          entered_at?: string | null
          final_score?: number | null
          fraud_score?: number | null
          id?: string
          is_flagged?: boolean | null
          is_revealed?: boolean | null
          rank?: number | null
          revealed_at?: string | null
          squad_id?: string | null
          status?: string
          submission_file_url?: string | null
          submission_text?: string | null
          submission_url?: string | null
          vote_count?: number | null
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_entries_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "forge_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_entries_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "forge_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_notifications: {
        Row: {
          body: string
          candidate_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forge_notifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_reactions: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          entry_id: string | null
          id: string
          reaction_type: string
          voter_ip: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          reaction_type: string
          voter_ip: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          reaction_type?: string
          voter_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "forge_reactions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_reactions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "forge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_reactions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "public_forge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_scoring_queue: {
        Row: {
          attempts: number | null
          candidate_id: string | null
          challenge_id: string | null
          created_at: string | null
          entry_id: string | null
          id: string
          priority: number | null
          skill_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          candidate_id?: string | null
          challenge_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          priority?: number | null
          skill_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          candidate_id?: string | null
          challenge_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          priority?: number | null
          skill_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_scoring_queue_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_scoring_queue_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "forge_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_scoring_queue_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "forge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_scoring_queue_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "public_forge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_scoring_queue_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_squad_members: {
        Row: {
          candidate_id: string
          joined_at: string | null
          role: string
          squad_id: string
          status: string | null
        }
        Insert: {
          candidate_id: string
          joined_at?: string | null
          role: string
          squad_id: string
          status?: string | null
        }
        Update: {
          candidate_id?: string
          joined_at?: string | null
          role?: string
          squad_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_squad_members_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "forge_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_squads: {
        Row: {
          badges: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          max_size: number | null
          member_ids: string[] | null
          name: string
          streak: number | null
          tagline: string | null
        }
        Insert: {
          badges?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          max_size?: number | null
          member_ids?: string[] | null
          name: string
          streak?: number | null
          tagline?: string | null
        }
        Update: {
          badges?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          max_size?: number | null
          member_ids?: string[] | null
          name?: string
          streak?: number | null
          tagline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_squads_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      forge_votes: {
        Row: {
          created_at: string | null
          entry_id: string | null
          id: string
          voter_id: string | null
          voter_ip: string
        }
        Insert: {
          created_at?: string | null
          entry_id?: string | null
          id?: string
          voter_id?: string | null
          voter_ip: string
        }
        Update: {
          created_at?: string | null
          entry_id?: string | null
          id?: string
          voter_id?: string | null
          voter_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "forge_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "forge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "public_forge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          description: string
          employer_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          job_type: string
          location: string
          requirements: string[] | null
          salary_range: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          description: string
          employer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_type: string
          location: string
          requirements?: string[] | null
          salary_range?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string
          employer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          location?: string
          requirements?: string[] | null
          salary_range?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_forge_entries: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          candidate_id: string | null
          challenge_id: string | null
          codename: string | null
          entered_at: string | null
          id: string | null
          is_revealed: boolean | null
          rank: number | null
          revealed_at: string | null
          squad_id: string | null
          status: string | null
          submission_text: string | null
          submission_url: string | null
          vote_count: number | null
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          candidate_id?: never
          challenge_id?: string | null
          codename?: string | null
          entered_at?: string | null
          id?: string | null
          is_revealed?: boolean | null
          rank?: number | null
          revealed_at?: string | null
          squad_id?: string | null
          status?: string | null
          submission_text?: string | null
          submission_url?: string | null
          vote_count?: number | null
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          candidate_id?: never
          challenge_id?: string | null
          codename?: string | null
          entered_at?: string | null
          id?: string | null
          is_revealed?: boolean | null
          rank?: number | null
          revealed_at?: string | null
          squad_id?: string | null
          status?: string | null
          submission_text?: string | null
          submission_url?: string | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "forge_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forge_entries_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "forge_squads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_final_rankings: {
        Args: { p_challenge_id: string }
        Returns: {
          ai_feedback: string | null
          ai_score: number | null
          candidate_id: string | null
          challenge_id: string | null
          codename: string
          entered_at: string | null
          final_score: number | null
          fraud_score: number | null
          id: string
          is_flagged: boolean | null
          is_revealed: boolean | null
          rank: number | null
          revealed_at: string | null
          squad_id: string | null
          status: string
          submission_file_url: string | null
          submission_text: string | null
          submission_url: string | null
          vote_count: number | null
          vote_score: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "forge_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      generate_codename: { Args: { p_challenge_id: string }; Returns: string }
      increment_entry_count: { Args: { row_id: string }; Returns: undefined }
      increment_vote: { Args: { row_id: string }; Returns: undefined }
      reveal_top_entries: {
        Args: { p_challenge_id: string; p_top_n: number }
        Returns: {
          ai_feedback: string | null
          ai_score: number | null
          candidate_id: string | null
          challenge_id: string | null
          codename: string
          entered_at: string | null
          final_score: number | null
          fraud_score: number | null
          id: string
          is_flagged: boolean | null
          is_revealed: boolean | null
          rank: number | null
          revealed_at: string | null
          squad_id: string | null
          status: string
          submission_file_url: string | null
          submission_text: string | null
          submission_url: string | null
          vote_count: number | null
          vote_score: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "forge_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
