'use client';

import { useState } from 'react';
import { User, Mail, Lock, Eye, UserCheck, Upload, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProfileClientProps {
  user: any;
  profile: any;
}

export default function ProfileClient({ user, profile: initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: profile.display_name,
          privacy_level: profile.privacy_level,
          accept_stranger_gifts: profile.accept_stranger_gifts,
          opt_in_random_exchange: profile.opt_in_random_exchange,
        })
        .eq('id', user.id);

      if (error) throw error;

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profile?.display_name || profile?.username}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">@{profile?.username}</p>
            <button className="mt-2 text-sm text-pink-600 dark:text-pink-400 hover:underline flex items-center space-x-1">
              <Upload className="w-4 h-4" />
              <span>Upload Avatar (Coming Soon)</span>
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profile?.display_name || ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed from here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Privacy Level
            </label>
            <select
              value={profile?.privacy_level || 'friends'}
              onChange={(e) => setProfile({ ...profile, privacy_level: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="closed">Closed - Only me</option>
              <option value="friends">Friends Only</option>
              <option value="public">Public - Everyone</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Controls who can view your profile and gift statistics
            </p>
          </div>

          {/* Preferences */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Accept Gifts from Strangers</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow non-friends to send you time gifts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile?.accept_stranger_gifts || false}
                  onChange={(e) => setProfile({ ...profile, accept_stranger_gifts: e.target.checked })}
                  disabled={!editing}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Random Gift Exchange</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Opt-in to exchange time gifts with random users
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile?.opt_in_random_exchange || false}
                  onChange={(e) => setProfile({ ...profile, opt_in_random_exchange: e.target.checked })}
                  disabled={!editing}
                  className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                <p className="text-sm text-pink-600 dark:text-pink-400 mb-1">Total Hours Gifted</p>
                <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">
                  {profile?.total_hours_gifted || 0}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Hours Received</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {profile?.total_hours_received || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex items-center space-x-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => {
                    setProfile(initialProfile);
                    setEditing(false);
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
