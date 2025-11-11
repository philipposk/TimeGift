import Link from 'next/link'
import { Gift, Heart, Clock, Users, Shield, Sparkles } from 'lucide-react'
import { Navigation } from '@/components/navigation'

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              The Most Meaningful Gift
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Gift Your Time with Love
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              The most precious gift you can give someone is your time. 
              Share moments, create memories, and strengthen bonds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Gift className="h-5 w-5" />
                Start Gifting
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-border px-8 py-4 text-lg font-semibold hover:bg-accent transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How TimeGift Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
                <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Write a Message</h3>
              <p className="text-muted-foreground">
                Express your love and commitment with a heartfelt message. Tell them how much they mean to you.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Time Amount</h3>
              <p className="text-muted-foreground">
                Decide how much of your time you want to gift. Hours, days - whatever feels right.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Connect</h3>
              <p className="text-muted-foreground">
                Send your gift and schedule time together. Build stronger relationships through quality time.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                More Than Just a Gift
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Track Your Gifts</h3>
                    <p className="text-muted-foreground">
                      Keep track of all the time you've gifted and received. See your impact over time.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Flexible Scheduling</h3>
                    <p className="text-muted-foreground">
                      Set your availability and let recipients choose when to redeem their gift.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Personal Touch</h3>
                    <p className="text-muted-foreground">
                      Upload photos of handwritten notes to make your gift even more special.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 p-1">
                <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                  <Gift className="h-32 w-32 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make Someone's Day?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start gifting your time today and create meaningful connections.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Gift className="h-5 w-5" />
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TimeGift. Made with ❤️ for meaningful connections.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
