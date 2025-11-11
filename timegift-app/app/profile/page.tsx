import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { ProfileForm } from '@/components/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: stats } = await supabase
    .from('gift_statistics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          <ProfileForm profile={profile} stats={stats} />
        </div>
      </main>
    </>
  )
}
