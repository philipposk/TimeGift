'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, User, Users, Settings, Moon, Sun, Menu, X, Calculator, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    id: string;
    username?: string;
    isAdmin?: boolean;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme, actualTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Gift, auth: false }, // Allow guests
    { href: '/profile', label: 'Profile', icon: User, auth: false }, // Allow guests
    { href: '/friends', label: 'Friends', icon: Users, auth: false }, // Allow guests
    { href: '/templates', label: 'Templates', icon: Sparkles, auth: false },
    { href: '/calculator', label: 'Time Calculator', icon: Calculator, auth: false },
    { href: '/about', label: 'About', icon: null, auth: false },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: Settings, auth: true });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <Gift className="w-8 h-8 text-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              TimeGift
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.auth && !user) return null;
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {actualTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Auth Buttons */}
            {!user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-md hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signout"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
              >
                Sign Out
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 w-full"
            >
              {actualTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>Toggle Theme</span>
            </button>

            {!user ? (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/auth/signout"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sign Out
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
