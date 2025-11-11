import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { GiftsList } from '@/components/gifts-list'

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: { tab?: string; success?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tab = searchParams.tab || 'received'

  // Get gifts sent
  const { data: giftsSent } = await supabase
    .from('gifts')
    .select('*, recipient:profiles!gifts_recipient_id_fkey(full_name, username, avatar_url)')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  // Get gifts received
  const { data: giftsReceived } = await supabase
    .from('gifts')
    .select('*, sender:profiles!gifts_sender_id_fkey(full_name, username, avatar_url)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Gifts</h1>
            <p className="text-muted-foreground">
              Manage the time you've gifted and received.
            </p>
          </div>

          {searchParams.success === 'gift_created' && (
            <div className="mb-6 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
              Gift created successfully! 🎁
            </div>
          )}

          <GiftsList
            giftsSent={giftsSent || []}
            giftsReceived={giftsReceived || []}
            initialTab={tab}
          />
        </div>
      </main>
    </>
  )
}
