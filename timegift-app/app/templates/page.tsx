'use client';

import { useState } from 'react';
import { Sparkles, Clock, Heart } from 'lucide-react';
import Navbar from '@/components/navbar';
import { giftTemplates, type GiftTemplate, formatTemplateMessage } from '@/lib/gift-templates';
import { generateGiftMessage } from '@/lib/ai';
import Link from 'next/link';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<GiftTemplate | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  const categories = [
    { id: 'all', name: 'All Templates', icon: '🎁' },
    { id: 'birthday', name: 'Birthday', icon: '🎂' },
    { id: 'holiday', name: 'Holiday', icon: '🎄' },
    { id: 'thank_you', name: 'Thank You', icon: '🙏' },
    { id: 'just_because', name: 'Just Because', icon: '💝' },
    { id: 'apology', name: 'Apology', icon: '💚' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? giftTemplates
    : giftTemplates.filter(t => t.category === selectedCategory);

  const handleTemplateClick = async (template: GiftTemplate) => {
    setSelectedTemplate(template);
    const defaultMessage = formatTemplateMessage(template);
    setAiMessage(defaultMessage);

    // Generate AI message
    setGeneratingAI(true);
    try {
      const aiGenerated = await generateGiftMessage(
        template.category,
        'your loved one',
        'friend',
        template.defaultTimeAmount,
        template.defaultTimeUnit
      );
      setAiMessage(aiGenerated);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Gift Templates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose from pre-made templates or get AI-powered message suggestions. 
            Customize them to make them your own!
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate?.id === template.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-4xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{template.defaultTimeAmount} {template.defaultTimeUnit}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              {selectedTemplate ? (
                <>
                  <div className="text-center mb-6">
                    <span className="text-5xl mb-4 block">{selectedTemplate.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Time Amount
                        </span>
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedTemplate.defaultTimeAmount} {selectedTemplate.defaultTimeUnit}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {generatingAI ? 'Generating AI message...' : 'Message Preview'}
                        </span>
                        {generatingAI && <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {aiMessage || formatTemplateMessage(selectedTemplate)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Use This Template
                  </Link>
                </>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a template to see preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
