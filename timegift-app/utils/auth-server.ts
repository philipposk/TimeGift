// Server-side Supabase Authentication utilities
import { createSupabaseServerClient } from '@/lib/supabase-server';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

// Server-side: Get current user (for API routes and Server Components)
export async function getServerUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    isAdmin: profile.is_admin,
  };
}

