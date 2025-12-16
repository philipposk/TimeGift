'use client';

import { useState } from 'react';
import { Calculator, Clock, Heart, AlertCircle, Sparkles } from 'lucide-react';
import Navbar from '@/components/navbar';
import Link from 'next/link';

export default function TimeCalculatorPage() {
  const [age1, setAge1] = useState<number>(30);
  const [age2, setAge2] = useState<number>(30);
  const [frequency, setFrequency] = useState<string>('monthly'); // daily, weekly, monthly, yearly
  const [hoursPerVisit, setHoursPerVisit] = useState<number>(2);
  const [calculated, setCalculated] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // Average life expectancy (can be made more sophisticated)
  const averageLifeExpectancy = 80;

  const calculateTime = () => {
    const avgAge = (age1 + age2) / 2;
    const yearsRemaining = Math.max(0, averageLifeExpectancy - avgAge);
    
    // Frequency multipliers
    const frequencyMultipliers: Record<string, number> = {
      daily: 365,
      weekly: 52,
      monthly: 12,
      yearly: 1,
    };
    
    const visitsPerYear = frequencyMultipliers[frequency] || 12;
    const totalVisits = visitsPerYear * yearsRemaining;
    const totalHours = totalVisits * hoursPerVisit;
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    setResult({
      yearsRemaining: yearsRemaining.toFixed(1),
      totalVisits: Math.floor(totalVisits),
      totalHours: Math.floor(totalHours),
      totalDays,
      remainingHours: Math.floor(remainingHours),
    });
    setCalculated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Time Left Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how much time you have left to spend with your loved ones. 
            This eye-opening calculation helps you realize the preciousness of every moment.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          <div className="space-y-6">
            {/* Age Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={age1}
                  onChange={(e) => setAge1(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Their Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={age2}
                  onChange={(e) => setAge2(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How often do you meet?
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Hours per visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Average hours spent together per visit
              </label>
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={hoursPerVisit}
                onChange={(e) => setHoursPerVisit(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateTime}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Calculate Time Left
            </button>
          </div>
        </div>

        {/* Results */}
        {calculated && result && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl font-bold mb-2">Time Remaining Together</h2>
              <p className="text-pink-100 text-lg">
                Based on average life expectancy and your meeting frequency
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-sm font-medium text-pink-100">Years Remaining</span>
                </div>
                <p className="text-4xl font-bold">{result.yearsRemaining}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="w-6 h-6" />
                  <span className="text-sm font-medium text-pink-100">Total Visits</span>
                </div>
                <p className="text-4xl font-bold">{result.totalVisits.toLocaleString()}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm font-medium text-pink-100">Total Hours</span>
                </div>
                <p className="text-4xl font-bold">{result.totalHours.toLocaleString()}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-sm font-medium text-pink-100">Total Days</span>
                </div>
                <p className="text-4xl font-bold">
                  {result.totalDays.toLocaleString()} days {result.remainingHours} hours
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <p className="text-lg font-medium mb-4">
                💝 Make every moment count!
              </p>
              <p className="text-pink-100 mb-6">
                This calculation is a reminder to prioritize quality time with the people you love. 
                Why not create a TimeGift right now?
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-3 bg-white text-pink-600 font-semibold rounded-full hover:bg-pink-50 transition-all transform hover:scale-105"
              >
                Create a TimeGift
              </Link>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">About this calculator:</p>
              <p>
                This calculation uses average life expectancy data and is meant as a thought-provoking tool 
                to help you realize the preciousness of time. Actual time together may vary based on many factors. 
                The important thing is to make the most of the time you have!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
