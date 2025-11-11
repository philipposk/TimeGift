import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/navbar';
import ProfileClient from '@/components/profile-client';

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const userData = {
    id: user.id,
    username: profile?.username,
    displayName: profile?.display_name,
    avatarUrl: profile?.avatar_url,
    isAdmin: profile?.is_admin,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      <ProfileClient user={userData} profile={profile} />
    </div>
  );
}
