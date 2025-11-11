export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  privacy_level: 'closed' | 'friends' | 'public'
  bio: string | null
  is_admin: boolean
  is_guest: boolean
  opt_in_random_matching: boolean
  created_at: string
  updated_at: string
}

export type Friendship = {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected'
  requested_by: string
  created_at: string
  updated_at: string
}

export type Gift = {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  time_amount: number
  original_time_amount: number
  time_unit: 'minutes' | 'hours' | 'days'
  purpose: string | null
  is_random_match: boolean
  status: 'pending' | 'accepted' | 'scheduled' | 'completed' | 'expired' | 'cancelled'
  expiry_date: string | null
  decay_rate: number
  last_decay_applied: string
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type GiftAvailability = {
  id: string
  gift_id: string
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
  specific_date: string | null
  created_at: string
}

export type GiftSchedule = {
  id: string
  gift_id: string
  scheduled_date: string
  start_time: string
  end_time: string
  notes: string | null
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: 'gift_received' | 'gift_accepted' | 'gift_scheduled' | 'reminder' | 'friend_request' | 'system'
  title: string
  message: string
  related_id: string | null
  read: boolean
  created_at: string
}

export type GiftStatistics = {
  id: string
  user_id: string
  total_time_gifted: number
  time_gifted_this_year: number
  time_gifted_this_month: number
  total_time_received: number
  time_received_this_year: number
  time_received_this_month: number
  total_gifts_sent: number
  total_gifts_received: number
  updated_at: string
}

export type AppSetting = {
  id: string
  setting_key: string
  setting_value: any
  description: string | null
  category: string | null
  updated_by: string | null
  updated_at: string
}
