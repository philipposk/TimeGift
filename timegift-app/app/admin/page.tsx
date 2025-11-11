import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/navbar';
import AdminPanelClient from '@/components/admin-panel-client';

export default async function AdminPage() {
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

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  // Get admin settings
  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')
    .order('setting_key');

  const userData = {
    id: user.id,
    username: profile?.username,
    isAdmin: profile?.is_admin,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      <AdminPanelClient settings={settings || []} />
    </div>
  );
}
