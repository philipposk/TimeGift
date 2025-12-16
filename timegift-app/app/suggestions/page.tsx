'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Gift, Heart, Zap } from 'lucide-react';
import Navbar from '@/components/navbar';
import { getCurrentUser } from '@/utils/auth';
import Link from 'next/link';
import { generateGiftSuggestions } from '@/lib/ai';

interface Suggestion {
  timeAmount: number;
  timeUnit: string;
  message: string;
  occasion?: string;
}

export default function SuggestionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [relationship, setRelationship] = useState('friend');
  const [occasion, setOccasion] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setUser(null);
          setSuggestions([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);
        await generateSuggestions('friend', null);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const generateSuggestions = async (rel: string, occ: string | null) => {
    setGenerating(true);
    try {
      const newSuggestions = await generateGiftSuggestions(rel, occ);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    generateSuggestions(relationship, occasion || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const userData = null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Navbar user={userData} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <Sparkles className="w-20 h-20 text-pink-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Gift Suggestions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Sign in to get personalized AI-powered gift suggestions based on your relationships and occasions!
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
        </div>
      </div>
    );
  }

  const userData = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Gift Suggestions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get personalized time gift suggestions powered by AI. Tell us about the relationship and occasion, and we'll suggest the perfect gift!
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="friend">Friend</option>
                <option value="family">Family</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="partner">Partner</option>
                <option value="colleague">Colleague</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Occasion (Optional)
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">None</option>
                <option value="birthday">Birthday</option>
                <option value="holiday">Holiday</option>
                <option value="thank_you">Thank You</option>
                <option value="anniversary">Anniversary</option>
                <option value="congratulations">Congratulations</option>
                <option value="apology">Apology</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Suggestions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600 transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {suggestion.timeAmount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.timeUnit}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {suggestion.message}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  <span>Use This Suggestion</span>
                  <Heart className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Suggestions Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a relationship and optionally an occasion, then click "Generate Suggestions" to get AI-powered recommendations!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
