'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Gift, Heart, Calendar, BarChart3, PieChart } from 'lucide-react';
import Navbar from '@/components/navbar';
import { getCurrentUser } from '@/utils/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setUser(null);
          setStats(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        if (!db) {
          setStats(null);
          setLoading(false);
          return;
        }

        // Get all gifts
        const sentGiftsQuery = query(
          collection(db, 'gifts'),
          where('sender_id', '==', currentUser.id),
          orderBy('created_at', 'desc')
        );
        const receivedGiftsQuery = query(
          collection(db, 'gifts'),
          where('recipient_id', '==', currentUser.id),
          orderBy('created_at', 'desc')
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentGiftsQuery),
          getDocs(receivedGiftsQuery),
        ]);

        const sentGifts = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const receivedGifts = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allGifts = [...sentGifts, ...receivedGifts];

        // Calculate statistics
        const totalHoursGifted = sentGifts.reduce((sum, gift) => {
          const hours = gift.time_unit === 'hours' ? gift.time_amount :
                       gift.time_unit === 'days' ? gift.time_amount * 24 :
                       gift.time_amount / 60;
          return sum + hours;
        }, 0);

        const totalHoursReceived = receivedGifts.reduce((sum, gift) => {
          const hours = gift.time_unit === 'hours' ? gift.time_amount :
                       gift.time_unit === 'days' ? gift.time_amount * 24 :
                       gift.time_amount / 60;
          return sum + hours;
        }, 0);

        // Monthly breakdown
        const monthlyData: Record<string, { sent: number; received: number }> = {};
        allGifts.forEach(gift => {
          const date = gift.created_at?.toDate ? gift.created_at.toDate() : new Date(gift.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { sent: 0, received: 0 };
          }
          const hours = gift.time_unit === 'hours' ? gift.time_amount :
                       gift.time_unit === 'days' ? gift.time_amount * 24 :
                       gift.time_amount / 60;
          if (gift.sender_id === currentUser.id) {
            monthlyData[monthKey].sent += hours;
          } else {
            monthlyData[monthKey].received += hours;
          }
        });

        const monthlyChartData = Object.entries(monthlyData)
          .sort()
          .slice(-12) // Last 12 months
          .map(([month, data]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            sent: Math.round(data.sent * 10) / 10,
            received: Math.round(data.received * 10) / 10,
          }));

        // Status breakdown
        const statusCounts = {
          pending: allGifts.filter(g => g.status === 'pending').length,
          accepted: allGifts.filter(g => g.status === 'accepted').length,
          scheduled: allGifts.filter(g => g.status === 'scheduled').length,
          completed: allGifts.filter(g => g.status === 'completed').length,
          expired: allGifts.filter(g => g.status === 'expired').length,
        };

        const statusChartData = [
          { name: 'Pending', value: statusCounts.pending, color: '#fbbf24' },
          { name: 'Accepted', value: statusCounts.accepted, color: '#3b82f6' },
          { name: 'Scheduled', value: statusCounts.scheduled, color: '#8b5cf6' },
          { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
          { name: 'Expired', value: statusCounts.expired, color: '#ef4444' },
        ].filter(item => item.value > 0);

        // Recipients breakdown (top 5)
        const recipientCounts: Record<string, number> = {};
        sentGifts.forEach(gift => {
          const recipient = gift.recipient_email || gift.recipient_phone || 'Unknown';
          recipientCounts[recipient] = (recipientCounts[recipient] || 0) + 1;
        });

        const topRecipients = Object.entries(recipientCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name: name.substring(0, 20), count }));

        setStats({
          totalHoursGifted: Math.round(totalHoursGifted * 10) / 10,
          totalHoursReceived: Math.round(totalHoursReceived * 10) / 10,
          totalGifts: allGifts.length,
          completedGifts: statusCounts.completed,
          monthlyChartData,
          statusChartData,
          topRecipients,
          averageGiftHours: allGifts.length > 0 
            ? Math.round((totalHoursGifted / sentGifts.length) * 10) / 10 
            : 0,
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
        setStats(null);
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
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
            <BarChart3 className="w-20 h-20 text-pink-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Time Impact Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Sign in to see beautiful analytics and insights about your time gifting journey!
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
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Time Impact Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Visual insights into your time gifting journey. See your impact, track trends, and celebrate your generosity.
          </p>
        </div>

        {!stats ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Data Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create and complete time gifts to see your analytics!
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours Gifted</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalHoursGifted}</p>
                  </div>
                  <Gift className="w-12 h-12 text-pink-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours Received</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalHoursReceived}</p>
                  </div>
                  <Heart className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gifts</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalGifts}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedGifts}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Monthly Time Gifting Trend
                </h3>
                {stats.monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="#ec4899" strokeWidth={2} name="Hours Gifted" />
                      <Line type="monotone" dataKey="received" stroke="#8b5cf6" strokeWidth={2} name="Hours Received" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-gray-400">
                    <p>No data available yet</p>
                  </div>
                )}
              </div>

              {/* Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Gift Status Distribution
                </h3>
                {stats.statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={stats.statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-gray-400">
                    <p>No data available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Recipients */}
            {stats.topRecipients.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Top Recipients
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topRecipients}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ec4899" name="Gifts Sent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Insights */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Your Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-pink-100 mb-2">Average Gift Size</p>
                  <p className="text-3xl font-bold">{stats.averageGiftHours} hours</p>
                </div>
                <div>
                  <p className="text-pink-100 mb-2">Completion Rate</p>
                  <p className="text-3xl font-bold">
                    {stats.totalGifts > 0 
                      ? Math.round((stats.completedGifts / stats.totalGifts) * 100) 
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-pink-100 mb-2">Net Time Impact</p>
                  <p className="text-3xl font-bold">
                    {Math.round((stats.totalHoursGifted - stats.totalHoursReceived) * 10) / 10} hours
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
