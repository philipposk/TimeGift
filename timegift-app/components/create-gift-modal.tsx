'use client';

import { useState } from 'react';
import { X, Clock, Heart, Mail, Phone, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';
import GiftTemplatesModal from './gift-templates-modal';
import { type GiftTemplate } from '@/lib/gift-templates';

type RecipientType = 'email' | 'phone';
type TimeUnit = 'minutes' | 'hours' | 'days';
type PurposeType = 'anything' | 'specific';
type AvailabilityType = 'open' | 'specific';

interface GiftFormState {
  recipientType: RecipientType;
  recipientEmail: string;
  recipientPhone: string;
  message: string;
  timeAmount: number;
  timeUnit: TimeUnit;
  purposeType: PurposeType;
  purposeDetails: string;
  availabilityType: AvailabilityType;
  availabilityData: Record<string, unknown> | null;
  expiryDate: string;
}

interface CreateGiftModalProps {
  onClose: () => void;
}

export default function CreateGiftModal({ onClose }: CreateGiftModalProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [formData, setFormData] = useState<GiftFormState>({
    recipientType: 'email',
    recipientEmail: '',
    recipientPhone: '',
    message: '',
    timeAmount: 2,
    timeUnit: 'hours',
    purposeType: 'anything',
    purposeDetails: '',
    availabilityType: 'open',
    availabilityData: null,
    expiryDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemplateSelect = (template: GiftTemplate, message: string) => {
    setFormData({
      ...formData,
      timeAmount: template.defaultTimeAmount,
      timeUnit: template.defaultTimeUnit,
      message: message,
    });
    setShowTemplates(false);
    setStep(2); // Move to message step
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert('Please sign in to create a gift');
        return;
      }

      const response = await fetch('/api/gifts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id, // Send userId for now
          recipientType: formData.recipientType,
          recipientEmail:
            formData.recipientType === 'email' ? formData.recipientEmail : undefined,
          recipientPhone:
            formData.recipientType === 'phone' ? formData.recipientPhone : undefined,
          message: formData.message,
          timeAmount: formData.timeAmount,
          timeUnit: formData.timeUnit,
          purposeType: formData.purposeType,
          purposeDetails:
            formData.purposeType === 'specific' ? formData.purposeDetails : undefined,
          availabilityData:
            formData.availabilityType === 'open' ? null : formData.availabilityData,
          expiryDate: formData.expiryDate || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to create gift');
      }

      window.location.reload();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected error creating gift';
      alert('Error creating gift: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showTemplates && (
        <GiftTemplatesModal
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
          recipientName={formData.recipientEmail || formData.recipientPhone || ''}
          relationship="friend"
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Time Gift</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Recipient</span>
            <span>Time & Message</span>
            <span>Details</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Who are you gifting time to?
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setFormData({ ...formData, recipientType: 'email' })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.recipientType === 'email'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Email Address</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send gift via email (recipient doesn't need account)</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, recipientType: 'phone' })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.recipientType === 'phone'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Phone Number</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send gift via SMS/WhatsApp</p>
                      </div>
                    </div>
                  </button>
                </div>

                {formData.recipientType === 'email' && (
                  <input
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    placeholder="recipient@example.com"
                    className="mt-4 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                )}

                {formData.recipientType === 'phone' && (
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="mt-4 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How much time are you gifting?
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    name="timeAmount"
                    value={formData.timeAmount}
                    onChange={handleChange}
                    min="1"
                    className="w-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    name="timeUnit"
                    value={formData.timeUnit}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your heartfelt message
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="I love you and I give you... ME. To do what you want with."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What can this time be used for?
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setFormData({ ...formData, purposeType: 'anything' })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.purposeType === 'anything'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Anything</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Let them decide how to use your time</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, purposeType: 'specific' })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.purposeType === 'specific'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Specific Activity</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Specify what you'll do together</p>
                      </div>
                    </div>
                  </button>
                </div>

                {formData.purposeType === 'specific' && (
                  <input
                    type="text"
                    name="purposeDetails"
                    value={formData.purposeDetails}
                    onChange={handleChange}
                    placeholder="e.g., Help with project, Coffee chat, Movie night..."
                    className="mt-4 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && formData.recipientType === 'email' && !formData.recipientEmail) ||
                (step === 1 && formData.recipientType === 'phone' && !formData.recipientPhone) ||
                (step === 2 && !formData.message)
              }
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Gift'}
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
