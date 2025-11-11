import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { GiftCreationForm } from '@/components/gift-creation-form'

export default async function CreateGiftPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is guest
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_guest')
    .eq('id', user.id)
    .single()

  if (profile?.is_guest) {
    redirect('/dashboard?error=guests_cannot_create_gifts')
  }

  // Get friends list
  const { data: friendships } = await supabase
    .from('friendships')
    .select('*, friend:profiles!friendships_friend_id_fkey(id, full_name, username, avatar_url)')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  const friends = friendships?.map((f: any) => f.friend) || []

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create a Time Gift 🎁</h1>
            <p className="text-muted-foreground">
              Share your most precious resource with someone you care about.
            </p>
          </div>
          <GiftCreationForm friends={friends} />
        </div>
      </main>
    </>
  )
}
