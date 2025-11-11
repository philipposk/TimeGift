'use client';

import { useState } from 'react';
import { Users, Search, UserPlus, Check, X, Mail, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FriendsClientProps {
  userId: string;
  friendships: any[];
}

export default function FriendsClient({ userId, friendships: initialFriendships }: FriendsClientProps) {
  const [friendships, setFriendships] = useState(initialFriendships);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'search'>('friends');

  // Process friendships
  const acceptedFriends = friendships
    .filter(f => f.status === 'accepted')
    .map(f => (f.user_id === userId ? f.friend : f.user));

  const pendingRequests = friendships
    .filter(f => f.status === 'pending' && f.friend_id === userId)
    .map(f => ({ ...f.user, friendshipId: f.id }));

  const sentRequests = friendships
    .filter(f => f.status === 'pending' && f.user_id === userId)
    .map(f => ({ ...f.friend, friendshipId: f.id }));

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, privacy_level')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq('id', userId)
        .limit(10);

      if (error) throw error;

      // Filter out existing friends
      const existingFriendIds = friendships.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      );
      const filtered = (data || []).filter(u => !existingFriendIds.includes(u.id));

      setSearchResults(filtered);
    } catch (error: any) {
      alert('Error searching users: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase.from('friendships').insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      });

      if (error) throw error;

      alert('Friend request sent!');
      window.location.reload();
    } catch (error: any) {
      alert('Error sending friend request: ' + error.message);
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      window.location.reload();
    } catch (error: any) {
      alert('Error accepting friend request: ' + error.message);
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      window.location.reload();
    } catch (error: any) {
      alert('Error rejecting friend request: ' + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Friends</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with people to gift time</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Friends ({acceptedFriends.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Pending</span>
              {pendingRequests.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Find Friends</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'friends' && (
            <div>
              {acceptedFriends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No friends yet</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="text-pink-600 dark:text-pink-400 font-semibold hover:underline"
                  >
                    Find friends to connect with
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedFriends.map((friend) => (
                    <div key={friend.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-pink-500 dark:hover:border-pink-500 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {friend.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {friend.display_name || friend.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{friend.username}
                          </p>
                        </div>
                      </div>
                      <button className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all">
                        Send Time Gift
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-6">
              {/* Received Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Friend Requests ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.friendshipId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {request.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {request.display_name || request.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{request.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => acceptFriendRequest(request.friendshipId)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request.friendshipId)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sent Requests */}
              {sentRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Sent Requests ({sentRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div key={request.friendshipId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {request.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {request.display_name || request.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{request.username}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Pending...</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingRequests.length === 0 && sentRequests.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No pending friend requests</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search by username or name..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Friend</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !searching ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Search for users to send friend requests
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
