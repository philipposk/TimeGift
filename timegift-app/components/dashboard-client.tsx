'use client';

import { useState } from 'react';
import { Gift, Clock, TrendingUp, Calendar, Plus, User, Heart, Bell } from 'lucide-react';
import Link from 'next/link';
import CreateGiftModal from './create-gift-modal';
import AcceptGiftModal from './accept-gift-modal';

interface DashboardClientProps {
  profile: any;
  sentGifts: any[];
  receivedGifts: any[];
  isGuest?: boolean;
}

export default function DashboardClient({ profile, sentGifts, receivedGifts, isGuest = false }: DashboardClientProps) {
  const [showCreateGift, setShowCreateGift] = useState(false);
  const [giftToAccept, setGiftToAccept] = useState<string | null>(null);

  // Calculate statistics
  const totalHoursGifted = profile?.total_hours_gifted || 0;
  const totalHoursReceived = profile?.total_hours_received || 0;
  const pendingGifts = receivedGifts.filter(g => g.status === 'pending').length;
  const completedGifts = sentGifts.filter(g => g.status === 'completed').length + receivedGifts.filter(g => g.status === 'completed').length;

  // Guest mode UI
  if (isGuest) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <Gift className="w-20 h-20 text-pink-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to TimeGift! 🎁
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            You're viewing in guest mode. Sign in to create time gifts, manage friends, and track your time gifting journey!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Get Started for Free
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Demo Dashboard Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-pink-500 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hours Gifted</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Gift className="w-12 h-12 text-pink-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hours Received</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Heart className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Gifts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Bell className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {profile?.display_name || profile?.username || 'Friend'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to gift some time or accept a gift?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hours Gifted</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalHoursGifted}</p>
            </div>
            <Gift className="w-12 h-12 text-pink-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hours Received</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalHoursReceived}</p>
            </div>
            <Heart className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Gifts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingGifts}</p>
            </div>
            <Bell className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedGifts}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => {
            if (isGuest) {
              window.location.href = '/auth/signup';
            } else {
              setShowCreateGift(true);
            }
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-xl transform hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">Create Time Gift</h3>
              <p className="text-pink-100">Gift your time to someone special</p>
            </div>
            <Plus className="w-12 h-12" />
          </div>
        </button>

        <Link
          href="/friends"
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl p-8 shadow-xl transform hover:scale-[1.02] transition-all border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Friends</h3>
              <p className="text-gray-600 dark:text-gray-400">Connect with people you care about</p>
            </div>
            <User className="w-12 h-12 text-purple-500" />
          </div>
        </Link>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Received Gifts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Received Gifts</h2>
            <Gift className="w-6 h-6 text-pink-500" />
          </div>
          
          {receivedGifts.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No gifts received yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {receivedGifts.map((gift) => (
                <div key={gift.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-pink-500 dark:hover:border-pink-500 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {gift.sender?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {gift.sender?.display_name || gift.sender?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(gift.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      gift.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      gift.status === 'accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      gift.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {gift.status}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{gift.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{gift.time_amount} {gift.time_unit}</span>
                    </div>
                    {gift.status === 'pending' && (
                      <button
                        onClick={() => setGiftToAccept(gift.id)}
                        className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                      >
                        Accept →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Gifts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sent Gifts</h2>
            <Calendar className="w-6 h-6 text-purple-500" />
          </div>
          
          {sentGifts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No gifts sent yet</p>
              <button 
                onClick={() => setShowCreateGift(true)}
                className="mt-4 text-pink-600 dark:text-pink-400 font-semibold hover:underline"
              >
                Create your first gift
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sentGifts.map((gift) => (
                <div key={gift.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        To: {gift.recipient_email || gift.recipient_phone || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(gift.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      gift.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      gift.status === 'accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      gift.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {gift.status}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{gift.message}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{gift.time_amount} {gift.time_unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Gift Modal */}
      {showCreateGift && (
        <CreateGiftModal
          onClose={() => setShowCreateGift(false)}
        />
      )}

      {giftToAccept && (
        <AcceptGiftModal
          giftId={giftToAccept}
          onClose={() => setGiftToAccept(null)}
          onAccepted={() => {
            setGiftToAccept(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
