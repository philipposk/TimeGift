'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Gift, Clock, Heart, X } from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

interface Reminder {
  type: string;
  title: string;
  message: string;
  giftId?: string;
  priority: string;
}

interface Suggestion {
  timeAmount: number;
  timeUnit: string;
  message: string;
  occasion?: string;
}

export default function SmartSuggestions() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !db) {
          setReminders([]);
          setSuggestions([]);
          setLoading(false);
          return;
        }

        // Get reminders
        try {
          const response = await fetch('/api/reminders');
          const data = await response.json();
          setReminders(data.reminders || []);
        } catch (error) {
          console.error('Error loading reminders:', error);
        }

        // Get recent gifts to generate suggestions
        const recentGiftsQuery = query(
          collection(db, 'gifts'),
          where('sender_id', '==', currentUser.id),
          orderBy('created_at', 'desc'),
          limit(5)
        );

        const recentSnapshot = await getDocs(recentGiftsQuery);
        const recentGifts = recentSnapshot.docs.map(doc => doc.data());

        // Generate AI suggestions based on recent activity
        if (recentGifts.length > 0) {
          try {
            const suggestionResponse = await fetch('/api/ai/suggest-gifts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                relationship: 'friend', // Could be enhanced to detect from recent gifts
                occasion: null,
              }),
            });
            const suggestionData = await suggestionResponse.json();
            setSuggestions(suggestionData.suggestions || []);
          } catch (error) {
            console.error('Error loading suggestions:', error);
          }
        }
      } catch (error) {
        console.error('Error loading smart suggestions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDismissReminder = (index: number) => {
    setDismissedReminders(new Set([...dismissedReminders, index.toString()]));
  };

  const visibleReminders = reminders.filter((_, index) => !dismissedReminders.has(index.toString()));

  if (loading || (visibleReminders.length === 0 && suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Reminders */}
      {visibleReminders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Smart Reminders</h3>
            </div>
          </div>
          <div className="space-y-3">
            {visibleReminders.map((reminder, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  reminder.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      {reminder.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reminder.message}
                    </p>
                    {reminder.giftId && (
                      <Link
                        href={`/dashboard`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                      >
                        View Gift →
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismissReminder(index)}
                    className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Gift Suggestions</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Based on your recent activity, here are some suggestions:
          </p>
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-pink-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {suggestion.timeAmount} {suggestion.timeUnit}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {suggestion.message}
                </p>
                <Link
                  href="/dashboard"
                  className="text-sm text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Create this gift →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
