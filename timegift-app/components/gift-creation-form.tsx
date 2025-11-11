'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Heart, Upload, Loader2, User, Target } from 'lucide-react'

const PRESET_MESSAGES = [
  "I love you and I give you... ME. To do what you want with.",
  "I'm gifting you my time because you're worth it.",
  "Let's spend quality time together. This is for you.",
  "I want to be there for you. Use this time however you need.",
]

const PRESET_PURPOSES = [
  "Anything you want",
  "Help with a project",
  "Quality time together",
  "Adventure/Activity",
  "Deep conversation",
  "Help around the house",
  "Learning something together",
  "Custom (specify below)",
]

export function GiftCreationForm({ friends }: { friends: any[] }) {
  const [recipientId, setRecipientId] = useState('')
  const [message, setMessage] = useState('')
  const [timeAmount, setTimeAmount] = useState('')
  const [timeUnit, setTimeUnit] = useState('hours')
  const [purpose, setPurpose] = useState('')
  const [customPurpose, setCustomPurpose] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!recipientId) {
        throw new Error('Please select a recipient')
      }

      if (!timeAmount || parseInt(timeAmount) <= 0) {
        throw new Error('Please enter a valid time amount')
      }

      // Convert time to minutes
      let minutes = parseInt(timeAmount)
      if (timeUnit === 'hours') minutes *= 60
      if (timeUnit === 'days') minutes *= 1440

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload photo if provided
      let photoUrl = null
      if (photo) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gift-photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('gift-photos')
          .getPublicUrl(fileName)
        
        photoUrl = publicUrl
      }

      // Get decay rate from settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'default_decay_rate')
        .single()

      const decayRate = settings ? parseFloat(settings.setting_value) : 0.05

      // Determine final purpose
      const finalPurpose = purpose === 'Custom (specify below)' ? customPurpose : purpose

      // Create gift
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .insert([
          {
            sender_id: user.id,
            recipient_id: recipientId,
            message,
            time_amount: minutes,
            original_time_amount: minutes,
            time_unit: timeUnit,
            purpose: finalPurpose,
            expiry_date: expiryDate || null,
            decay_rate: decayRate,
            photo_url: photoUrl,
          },
        ])
        .select()
        .single()

      if (giftError) throw giftError

      // Create notification for recipient
      await supabase.from('notifications').insert([
        {
          user_id: recipientId,
          type: 'gift_received',
          title: 'You received a time gift! 🎁',
          message: `${user.email} has gifted you their time. Check it out!`,
          related_id: gift.id,
        },
      ])

      // Update statistics
      const { data: senderStats } = await supabase
        .from('gift_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const now = new Date()
      const isThisYear = true // In production, check if current year matches
      const isThisMonth = true // In production, check if current month matches

      await supabase
        .from('gift_statistics')
        .upsert({
          user_id: user.id,
          total_time_gifted: (senderStats?.total_time_gifted || 0) + minutes,
          time_gifted_this_year: (senderStats?.time_gifted_this_year || 0) + (isThisYear ? minutes : 0),
          time_gifted_this_month: (senderStats?.time_gifted_this_month || 0) + (isThisMonth ? minutes : 0),
          total_gifts_sent: (senderStats?.total_gifts_sent || 0) + 1,
        })

      router.push('/gifts?success=gift_created')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Recipient Selection */}
      <div>
        <label htmlFor="recipient" className="block text-sm font-medium mb-2">
          <User className="inline h-4 w-4 mr-1" />
          Who are you gifting time to? *
        </label>
        <select
          id="recipient"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          required
        >
          <option value="">Select a friend...</option>
          {friends.map((friend) => (
            <option key={friend.id} value={friend.id}>
              {friend.full_name || friend.username}
            </option>
          ))}
        </select>
        {friends.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            You need to add friends first. <a href="/friends" className="text-primary hover:underline">Add friends</a>
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          <Heart className="inline h-4 w-4 mr-1" />
          Your heartfelt message *
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          rows={4}
          placeholder="Write your message here..."
          required
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESET_MESSAGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMessage(preset)}
              className="text-xs px-3 py-1 rounded-full bg-accent hover:bg-accent/80 transition-colors"
            >
              {preset.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium mb-2">
          <Target className="inline h-4 w-4 mr-1" />
          What can this time be used for?
        </label>
        <select
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring mb-2"
        >
          <option value="">Select purpose...</option>
          {PRESET_PURPOSES.map((preset, idx) => (
            <option key={idx} value={preset}>
              {preset}
            </option>
          ))}
        </select>
        {purpose === 'Custom (specify below)' && (
          <input
            type="text"
            value={customPurpose}
            onChange={(e) => setCustomPurpose(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Specify what the time can be used for..."
          />
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Be clear about what you're offering - from "anything" to specific activities
        </p>
      </div>

      {/* Time Amount */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <Clock className="inline h-4 w-4 mr-1" />
          How much time are you gifting? *
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            value={timeAmount}
            onChange={(e) => setTimeAmount(e.target.value)}
            className="flex-1 px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Amount"
            min="1"
            required
          />
          <select
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value)}
            className="px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>

      {/* Expiry Date */}
      <div>
        <label htmlFor="expiry" className="block text-sm font-medium mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          Expiry Date (Optional)
        </label>
        <input
          type="date"
          id="expiry"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave blank for no expiry
        </p>
      </div>

      {/* Photo Upload */}
      <div>
        <label htmlFor="photo" className="block text-sm font-medium mb-2">
          <Upload className="inline h-4 w-4 mr-1" />
          Upload Handwritten Note (Optional)
        </label>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {photoPreview && (
          <div className="mt-3">
            <img
              src={photoPreview}
              alt="Preview"
              className="max-w-full h-auto rounded-lg border border-border"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Make your gift extra special with a photo of a handwritten note
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || friends.length === 0}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Creating Gift...' : 'Send Gift 🎁'}
      </button>
    </form>
  )
}
