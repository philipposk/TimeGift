import Link from 'next/link';
import { Gift, Heart, Clock, Sparkles } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Our Story</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">TimeGift</span>
          </h1>
        </div>

        {/* Story Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="flex items-center space-x-3 mb-6">
              <Gift className="w-10 h-10 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                Born from a Simple Moment
              </h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              TimeGift was created out of a genuine moment of uncertainty. I wanted to give something meaningful 
              to my cousin, but nothing felt quite right. Gift cards seemed impersonal. Material things felt 
              temporary. Then it hit me...
            </p>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 my-8 border-l-4 border-pink-500">
              <p className="text-gray-800 dark:text-gray-200 text-xl font-medium italic m-0">
                "The most precious thing I could give wasn't something you could buy. 
                It was my time—my presence, my attention, my willingness to simply be there."
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              In our busy world, time has become our scarcest resource. We're always rushing, always 
              distracted, always "somewhere else." But what if we could gift the one thing that truly 
              matters? What if we could promise someone: "I'm giving you... ME. To do whatever you want with."
            </p>

            <div className="flex items-center space-x-3 mb-6 mt-10">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white m-0">
                The Power of Presence
              </h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              TimeGift makes it beautiful and intentional. You're not just saying "let's hang out sometime." 
              You're creating a meaningful commitment:
            </p>

            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-lg mb-6">
              <li className="flex items-start">
                <Clock className="w-6 h-6 text-pink-500 mr-3 mt-1 flex-shrink-0" />
                <span>A specific amount of time, dedicated entirely to them</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                <span>A heartfelt message explaining why this gift matters</span>
              </li>
              <li className="flex items-start">
                <Gift className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <span>The freedom for them to choose how to use your time together</span>
              </li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 my-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 What Can You Do With Gifted Time?
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Absolutely anything! The beauty of TimeGift is its flexibility:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Help with a project (painting, moving, fixing something)</li>
                <li>• Quality time together (coffee chat, walk in the park, movie night)</li>
                <li>• Learning something new (teach me guitar, show me your favorite recipe)</li>
                <li>• Adventure time (hiking, exploring a new place)</li>
                <li>• Simply being there (listening, talking, sharing silence)</li>
              </ul>
            </div>

            <div className="flex items-center space-x-3 mb-6 mt-10">
              <Heart className="w-8 h-8 text-pink-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white m-0">
                For Everyone Who Matters
              </h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              TimeGift isn't just for romantic relationships or close family. It's for:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">👨‍👩‍👧‍👦 Family</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Gift time to parents, siblings, cousins, grandparents
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">🫂 Friends</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Show friends they matter with dedicated quality time
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">❤️ Partners</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Romantic gestures that go beyond flowers
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">🌟 Anyone</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Even opt-in for random exchanges with strangers
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mt-8">
              TimeGift is my way of making this beautiful concept accessible to everyone. Because in the end, 
              the greatest gift you can give someone is knowing that they matter enough for you to dedicate 
              your most valuable resource: your time.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Gift Your Time?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Join TimeGift today and start creating meaningful connections
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
