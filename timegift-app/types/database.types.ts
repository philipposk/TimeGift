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
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          username: string
          display_name: string | null
          avatar_url: string | null
          privacy_level: 'closed' | 'friends' | 'public'
          accept_stranger_gifts: boolean
          opt_in_random_exchange: boolean
          total_hours_gifted: number
          total_hours_received: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      gifts: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          recipient_email: string | null
          recipient_phone: string | null
          message: string
          time_amount: number // in minutes
          original_time_amount: number // for tracking decay
          time_unit: 'minutes' | 'hours' | 'days'
          purpose_type: 'anything' | 'specific'
          purpose_details: string | null
          status: 'pending' | 'accepted' | 'scheduled' | 'completed' | 'expired' | 'declined'
          availability_data: Json | null // sender's available time slots
          scheduled_datetime: string | null
          expiry_date: string | null
          photo_card_url: string | null
          is_random_exchange: boolean
          created_at: string
          updated_at: string
          accepted_at: string | null
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['gifts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gifts']['Insert']>
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['friendships']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['friendships']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          gift_id: string | null
          type: 'gift_received' | 'gift_accepted' | 'gift_scheduled' | 'reminder' | 'friend_request' | 'system'
          title: string
          message: string
          is_read: boolean
          sent_via: 'in_app' | 'email' | 'sms' | 'whatsapp' | 'viber' | 'messenger' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          updated_at: string
          updated_by: string
        }
        Insert: Omit<Database['public']['Tables']['admin_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admin_settings']['Insert']>
      }
      random_exchange_queue: {
        Row: {
          id: string
          user_id: string
          time_amount: number
          time_unit: 'minutes' | 'hours' | 'days'
          purpose_type: 'anything' | 'specific'
          purpose_details: string | null
          matched: boolean
          matched_with: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['random_exchange_queue']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['random_exchange_queue']['Insert']>
      }
    }
  }
}
