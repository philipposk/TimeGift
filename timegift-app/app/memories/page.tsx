'use client';

import { useEffect, useState } from 'react';
import { Camera, Heart, Calendar, MapPin, Sparkles, X } from 'lucide-react';
import Navbar from '@/components/navbar';
import { getCurrentUser } from '@/utils/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Memory {
  id: string;
  gift_id: string;
  gift?: any;
  photo_url?: string;
  story?: string;
  location?: string;
  created_at: any;
}

export default function MemoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showAddMemory, setShowAddMemory] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setUser(null);
          setMemories([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        if (!db) {
          setMemories([]);
          setLoading(false);
          return;
        }

        // Get completed gifts
        const completedGiftsQuery = query(
          collection(db, 'gifts'),
          where('status', '==', 'completed'),
          where('sender_id', '==', currentUser.id),
          orderBy('completed_at', 'desc')
        );

        const receivedGiftsQuery = query(
          collection(db, 'gifts'),
          where('status', '==', 'completed'),
          where('recipient_id', '==', currentUser.id),
          orderBy('completed_at', 'desc')
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(completedGiftsQuery),
          getDocs(receivedGiftsQuery),
        ]);

        const allGifts = [
          ...sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'sent' })),
          ...receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'received' })),
        ];

        // Get memories for these gifts
        const memoriesList: Memory[] = [];
        for (const gift of allGifts) {
          // Check if gift has memory data (stored in gift or separate collection)
          if (gift.memory_photo_url || gift.memory_story) {
            memoriesList.push({
              id: gift.id,
              gift_id: gift.id,
              gift: gift,
              photo_url: gift.memory_photo_url,
              story: gift.memory_story,
              location: gift.memory_location,
              created_at: gift.completed_at || gift.created_at,
            });
          }
        }

        setMemories(memoriesList.sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        }));
      } catch (error) {
        console.error('Error loading memories:', error);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading memories...</p>
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
            <Camera className="w-20 h-20 text-pink-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Time Memories Gallery
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Sign in to view and create beautiful memories from your completed time gifts!
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
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Time Memories Gallery
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A beautiful collection of moments spent together. Each completed time gift becomes a cherished memory.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{memories.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memories Created</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {memories.filter(m => m.photo_url).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">With Photos</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {memories.filter(m => m.story).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">With Stories</p>
          </div>
        </div>

        {/* Memories Grid */}
        {memories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Memories Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete a time gift and add a photo or story to create your first memory!
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => {
              const date = memory.created_at?.toDate 
                ? memory.created_at.toDate() 
                : new Date(memory.created_at);
              
              return (
                <button
                  key={memory.id}
                  onClick={() => setSelectedMemory(memory)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all text-left group"
                >
                  {memory.photo_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={memory.photo_url}
                        alt="Memory"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="font-semibold text-sm mb-1">
                          {memory.gift?.message?.substring(0, 50)}...
                        </p>
                        <div className="flex items-center space-x-2 text-xs opacity-90">
                          <Calendar className="w-3 h-3" />
                          <span>{date.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-pink-500 opacity-50" />
                    </div>
                  )}
                  <div className="p-4">
                    {memory.story && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {memory.story}
                      </p>
                    )}
                    {memory.location && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{memory.location}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedMemory(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedMemory.photo_url && (
                <img
                  src={selectedMemory.photo_url}
                  alt="Memory"
                  className="w-full h-64 object-cover"
                />
              )}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  {selectedMemory.created_at?.toDate 
                    ? selectedMemory.created_at.toDate().toLocaleDateString()
                    : new Date(selectedMemory.created_at).toLocaleDateString()}
                </span>
                {selectedMemory.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    <span>{selectedMemory.location}</span>
                  </>
                )}
              </div>
              {selectedMemory.gift?.message && (
                <div className="mb-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{selectedMemory.gift.message}"
                  </p>
                </div>
              )}
              {selectedMemory.story && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Story</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedMemory.story}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
