import Link from 'next/link';
import { Gift, Heart, Clock, Users, Sparkles, Calendar } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                The most meaningful gift
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gift Your Time
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">With Love</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Because sometimes the best gift is simply being there. Create personalized time gifts 
              for the people you care about.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                Start Gifting Time
              </Link>
              <Link
                href="/calculator"
                className="px-8 py-4 text-lg font-semibold text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-800 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700 transition-all shadow-md border-2 border-pink-200 dark:border-pink-800"
              >
                Calculate Time Left
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Hero Image/Illustration Placeholder */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 rounded-3xl p-8 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg">
                  <Gift className="w-12 h-12 text-pink-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Create Gift</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Write a heartfelt message and specify how much time you want to gift
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg">
                  <Calendar className="w-12 h-12 text-purple-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Schedule</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Set your availability and let the recipient choose when to redeem
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg">
                  <Heart className="w-12 h-12 text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Connect</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Spend quality time together doing what matters most
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Gift Time?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              In a world of material things, your time and presence is the most precious gift you can give
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Clock className="w-10 h-10 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Flexible Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Set your availability or leave it open. Recipients can choose when to redeem their gift.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Users className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Connect with Anyone</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gift time to friends, family, or even opt-in for random exchanges with others.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Beautiful Cards</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload handwritten notes and enhance them with AI for a personal touch.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Gift className="w-10 h-10 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Smart Notifications</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive reminders via SMS, WhatsApp, or your favorite messaging platform.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Track Your Impact</h3>
              <p className="text-gray-600 dark:text-gray-300">
                See how much time you've gifted and received with beautiful statistics.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Calendar Sync</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically sync scheduled time gifts with Google Calendar and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Give the Gift of Time?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join TimeGift today and start creating meaningful connections through the gift of your presence.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="w-6 h-6 text-pink-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">TimeGift</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Gift your time with love. The most meaningful present you can give.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-pink-500">About</Link></li>
                <li><Link href="/auth/signin" className="hover:text-pink-500">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-pink-500">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-pink-500">Help Center</a></li>
                <li><a href="#" className="hover:text-pink-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-pink-500">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} TimeGift. Made with ❤️ to help people gift what matters most.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
