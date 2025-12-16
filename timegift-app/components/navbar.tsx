'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, User, Users, Settings, Moon, Sun, Menu, X, Calculator, Sparkles, Camera, BarChart3, ChevronDown, Home, Heart, Wrench, Info } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  user?: {
    id: string;
    username?: string;
    isAdmin?: boolean;
  } | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  auth: boolean;
}

interface NavCategory {
  label: string;
  icon: any;
  items: NavItem[];
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme, actualTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileCategories, setOpenMobileCategories] = useState<Set<string>>(new Set());
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  // Organized navigation categories
  const navCategories: NavCategory[] = [
    {
      label: 'Main',
      icon: Home,
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Gift, auth: false },
        { href: '/profile', label: 'Profile', icon: User, auth: false },
      ],
    },
    {
      label: 'Social',
      icon: Users,
      items: [
        { href: '/friends', label: 'Friends', icon: Users, auth: false },
        { href: '/memories', label: 'Memories', icon: Camera, auth: false },
      ],
    },
    {
      label: 'Tools',
      icon: Wrench,
      items: [
        { href: '/templates', label: 'Templates', icon: Sparkles, auth: false },
        { href: '/suggestions', label: 'AI Suggestions', icon: Sparkles, auth: false },
        { href: '/calculator', label: 'Time Calculator', icon: Calculator, auth: false },
      ],
    },
    {
      label: 'Insights',
      icon: BarChart3,
      items: [
        { href: '/analytics', label: 'Analytics', icon: BarChart3, auth: false },
      ],
    },
  ];

  // Standalone items (no category)
  const standaloneItems: NavItem[] = [
    { href: '/about', label: 'About', icon: Info, auth: false },
  ];

  if (user?.isAdmin) {
    standaloneItems.push({ href: '/admin', label: 'Admin', icon: Settings, auth: true });
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach((key) => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key]?.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="hidden md:flex items-center space-x-4">
            {/* Category Dropdowns */}
            {navCategories.map((category) => {
              const CategoryIcon = category.icon;
              const hasActiveItem = category.items.some(item => pathname === item.href);
              const isOpen = openDropdown === category.label;
              
              return (
                <div key={category.label} className="relative" ref={(el) => (dropdownRefs.current[category.label] = el)}>
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : category.label)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      hasActiveItem
                        ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400'
                    }`}
                  >
                    <CategoryIcon className="w-4 h-4" />
                    <span>{category.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      {category.items.map((item) => {
                        if (item.auth && !user) return null;
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                              isActive
                                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone Items */}
            {standaloneItems.map((item) => {
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
          <div className="px-4 py-3 space-y-1">
            {/* Categories with sections */}
            {navCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isCategoryOpen = openMobileCategories.has(category.label);
              
              const toggleCategory = () => {
                const newSet = new Set(openMobileCategories);
                if (isCategoryOpen) {
                  newSet.delete(category.label);
                } else {
                  newSet.add(category.label);
                }
                setOpenMobileCategories(newSet);
              };
              
              return (
                <div key={category.label}>
                  <button
                    onClick={toggleCategory}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCategoryOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.items.map((item) => {
                        if (item.auth && !user) return null;
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setOpenMobileCategories(new Set());
                            }}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive
                                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone Items */}
            {standaloneItems.map((item) => {
              if (item.auth && !user) return null;
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
