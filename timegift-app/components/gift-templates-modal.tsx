'use client';

import { useState } from 'react';
import { X, Sparkles, Clock, Heart } from 'lucide-react';
import { giftTemplates, type GiftTemplate, formatTemplateMessage } from '@/lib/gift-templates';
import { generateGiftMessage } from '@/lib/ai';

interface GiftTemplatesModalProps {
  onSelectTemplate: (template: GiftTemplate, message: string) => void;
  onClose: () => void;
  recipientName?: string;
  relationship?: string;
}

export default function GiftTemplatesModal({ 
  onSelectTemplate, 
  onClose,
  recipientName = '',
  relationship = 'friend'
}: GiftTemplatesModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<GiftTemplate | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [useAI, setUseAI] = useState(false);

  const handleTemplateSelect = async (template: GiftTemplate) => {
    setSelectedTemplate(template);
    
    // Generate default message
    const defaultMessage = formatTemplateMessage(template, recipientName);
    setAiMessage(defaultMessage);

    // Optionally generate AI message
    if (useAI && recipientName) {
      setGeneratingAI(true);
      try {
        const aiGenerated = await generateGiftMessage(
          template.category,
          recipientName,
          relationship,
          template.defaultTimeAmount,
          template.defaultTimeUnit
        );
        setAiMessage(aiGenerated);
      } catch (error) {
        console.error('AI generation failed:', error);
        // Keep default message
      } finally {
        setGeneratingAI(false);
      }
    }
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, aiMessage || formatTemplateMessage(selectedTemplate, recipientName));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a Template</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select a template to get started, then customize it
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* AI Toggle */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">AI-Powered Messages</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate personalized messages using AI
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {giftTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedTemplate?.id === template.id
                    ? `border-${template.color}-500 bg-${template.color}-50 dark:bg-${template.color}-900/20`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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

          {/* Selected Template Preview */}
          {selectedTemplate && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Preview Message
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                {generatingAI ? (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Generating AI message...</span>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {aiMessage || formatTemplateMessage(selectedTemplate, recipientName)}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Time: {selectedTemplate.defaultTimeAmount} {selectedTemplate.defaultTimeUnit}</p>
                  <p>You can customize this after selecting</p>
                </div>
                <button
                  onClick={handleUseTemplate}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Use This Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
