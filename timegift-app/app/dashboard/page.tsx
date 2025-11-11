import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { Gift, Clock, Users, TrendingUp, Send, Inbox } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get statistics
  const { data: stats } = await supabase
    .from('gift_statistics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get recent gifts sent
  const { data: giftsSent } = await supabase
    .from('gifts')
    .select('*, recipient:profiles!gifts_recipient_id_fkey(full_name, username)')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent gifts received
  const { data: giftsReceived } = await supabase
    .from('gifts')
    .select('*, sender:profiles!gifts_sender_id_fkey(full_name, username)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get unread notifications count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name || profile?.username}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your time gifts.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Total Time Gifted</div>
                <Send className="h-4 w-4 text-pink-500" />
              </div>
              <div className="text-2xl font-bold">{formatTime(stats?.total_time_gifted || 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.total_gifts_sent || 0} gifts sent
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Time Received</div>
                <Inbox className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{formatTime(stats?.total_time_received || 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.total_gifts_received || 0} gifts received
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">This Year</div>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{formatTime(stats?.time_gifted_this_year || 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">Gifted in 2025</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">This Month</div>
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{formatTime(stats?.time_gifted_this_month || 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">Gifted this month</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/gifts/create"
              className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-lg p-6 hover:opacity-90 transition-opacity"
            >
              <Gift className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-1">Create a Gift</h3>
              <p className="text-sm text-white/80">Share your time with someone special</p>
            </Link>

            <Link
              href="/friends"
              className="bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors"
            >
              <Users className="h-8 w-8 mb-3 text-blue-500" />
              <h3 className="text-lg font-semibold mb-1">Manage Friends</h3>
              <p className="text-sm text-muted-foreground">Connect with people you care about</p>
            </Link>

            <Link
              href="/notifications"
              className="bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors relative"
            >
              <Users className="h-8 w-8 mb-3 text-orange-500" />
              <h3 className="text-lg font-semibold mb-1">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {unreadCount || 0} unread notifications
              </p>
              {unreadCount && unreadCount > 0 && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gifts Sent */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Gifts Sent</h2>
                <Link href="/gifts?tab=sent" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {giftsSent && giftsSent.length > 0 ? (
                  giftsSent.map((gift: any) => (
                    <div key={gift.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                      <div className="flex-1">
                        <div className="font-medium">{gift.recipient?.full_name || gift.recipient?.username}</div>
                        <div className="text-sm text-muted-foreground truncate">{gift.message}</div>
                      </div>
                      <div className="text-sm font-medium ml-4">{formatTime(gift.time_amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No gifts sent yet</p>
                    <Link href="/gifts/create" className="text-primary hover:underline text-sm">
                      Create your first gift
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Gifts Received */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Gifts Received</h2>
                <Link href="/gifts?tab=received" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {giftsReceived && giftsReceived.length > 0 ? (
                  giftsReceived.map((gift: any) => (
                    <div key={gift.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                      <div className="flex-1">
                        <div className="font-medium">{gift.sender?.full_name || gift.sender?.username}</div>
                        <div className="text-sm text-muted-foreground truncate">{gift.message}</div>
                      </div>
                      <div className="text-sm font-medium ml-4">{formatTime(gift.time_amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Inbox className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No gifts received yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
