import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/navbar';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
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

  // Get user's gifts (sent and received)
  const { data: sentGifts } = await supabase
    .from('gifts')
    .select('*')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false });

  const { data: receivedGifts } = await supabase
    .from('gifts')
    .select('*, sender:sender_id(username, display_name, avatar_url)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

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
      <DashboardClient 
        user={userData} 
        profile={profile} 
        sentGifts={sentGifts || []} 
        receivedGifts={receivedGifts || []} 
      />
    </div>
  );
}
