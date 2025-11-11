'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Lock, Globe, Users, EyeOff, Loader2, Clock } from 'lucide-react'

export function ProfileForm({ profile, stats }: { profile: any; stats: any }) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [privacyLevel, setPrivacyLevel] = useState(profile?.privacy_level || 'friends')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio,
          privacy_level: privacyLevel,
        })
        .eq('id', profile.id)

      if (error) throw error

      setSuccess('Profile updated successfully!')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Your Gift Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Gifted</div>
            <div className="text-2xl font-bold text-pink-600">{formatTime(stats?.total_time_gifted || 0)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Received</div>
            <div className="text-2xl font-bold text-purple-600">{formatTime(stats?.total_time_received || 0)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Gifts Sent</div>
            <div className="text-2xl font-bold text-blue-600">{stats?.total_gifts_sent || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Gifts Received</div>
            <div className="text-2xl font-bold text-green-600">{stats?.total_gifts_received || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">This Year</div>
            <div className="text-2xl font-bold">{formatTime(stats?.time_gifted_this_year || 0)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">This Month</div>
            <div className="text-2xl font-bold">{formatTime(stats?.time_gifted_this_month || 0)}</div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tell people about yourself..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Privacy Level</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="closed"
                  checked={privacyLevel === 'closed'}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <EyeOff className="h-4 w-4" />
                    Private
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Only you can see your profile and statistics
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="friends"
                  checked={privacyLevel === 'friends'}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4" />
                    Friends Only
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Only your friends can see your profile and statistics
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={privacyLevel === 'public'}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Globe className="h-4 w-4" />
                    Public
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Anyone can see your profile and statistics
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
