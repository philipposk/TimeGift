'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gift, Users, Bell, Settings, User, LogOut, Home, Info } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)

        // Get unread notifications count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)
        setNotifications(count || 0)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/gifts', label: 'Gifts', icon: Gift },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: notifications },
    { href: '/about', label: 'About', icon: Info },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <Gift className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                TimeGift
              </span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary relative ${
                      pathname === item.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
