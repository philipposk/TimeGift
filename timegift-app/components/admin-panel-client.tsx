'use client';

import { useState } from 'react';
import { Settings, Clock, Bell, Palette, Zap, Key } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminPanelClientProps {
  settings: any[];
}

export default function AdminPanelClient({ settings: initialSettings }: AdminPanelClientProps) {
  const [settings, setSettings] = useState<Record<string, any>>(
    initialSettings.reduce((acc, s) => ({ ...acc, [s.setting_key]: s.setting_value }), {})
  );
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const saveSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
      alert('Settings saved successfully!');
    } catch (error: any) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'decay', label: 'Time Decay', icon: Clock },
    { id: 'apis', label: 'API Keys', icon: Key },
    { id: 'features', label: 'Features', icon: Zap },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system settings and configuration</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">General Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Configure basic app settings and behavior.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  General settings will be expanded in future versions. Currently managed through other tabs.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Theme Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Theme
                  </label>
                  <select
                    value={settings.theme?.default || 'light'}
                    onChange={(e) => {
                      const newTheme = { ...settings.theme, default: e.target.value };
                      saveSetting('theme', newTheme);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowUserOverride"
                    checked={settings.theme?.allow_user_override !== false}
                    onChange={(e) => {
                      const newTheme = { ...settings.theme, allow_user_override: e.target.checked };
                      saveSetting('theme', newTheme);
                    }}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="allowUserOverride" className="text-sm text-gray-700 dark:text-gray-300">
                    Allow users to override theme preference
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={settings.notifications?.frequency || 'immediate'}
                    onChange={(e) => {
                      const newNotif = { ...settings.notifications, frequency: e.target.value };
                      saveSetting('notifications', newNotif);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reminder Messages (one per line)
                  </label>
                  <textarea
                    value={settings.notifications?.reminder_messages?.join('\n') || ''}
                    onChange={(e) => {
                      const messages = e.target.value.split('\n').filter(m => m.trim());
                      const newNotif = { ...settings.notifications, reminder_messages: messages };
                      saveSetting('notifications', newNotif);
                    }}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="You have been summoned!&#10;Time to be redeemed!&#10;Someone awaits your gift of time!"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'decay' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Time Decay Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="decayEnabled"
                    checked={settings.time_decay?.enabled !== false}
                    onChange={(e) => {
                      const newDecay = { ...settings.time_decay, enabled: e.target.checked };
                      saveSetting('time_decay', newDecay);
                    }}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="decayEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                    Enable time decay for unredeemed gifts
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Decay Rate (% per interval)
                  </label>
                  <input
                    type="number"
                    value={settings.time_decay?.rate_percent || 5}
                    onChange={(e) => {
                      const newDecay = { ...settings.time_decay, rate_percent: parseInt(e.target.value) };
                      saveSetting('time_decay', newDecay);
                    }}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Decay Interval (days)
                  </label>
                  <input
                    type="number"
                    value={settings.time_decay?.interval_days || 7}
                    onChange={(e) => {
                      const newDecay = { ...settings.time_decay, interval_days: parseInt(e.target.value) };
                      saveSetting('time_decay', newDecay);
                    }}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grace Period (days)
                  </label>
                  <input
                    type="number"
                    value={settings.time_decay?.grace_period_days || 3}
                    onChange={(e) => {
                      const newDecay = { ...settings.time_decay, grace_period_days: parseInt(e.target.value) };
                      saveSetting('time_decay', newDecay);
                    }}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Number of days before decay starts
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">API Configuration</h3>
              
              <div className="space-y-6">
                {/* Vonage API */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Vonage SMS API</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={settings.vonage_api?.enabled ?? false}
                          onChange={(e) => {
                            const newVonage = { ...settings.vonage_api, enabled: e.target.checked };
                            setSettings({ ...settings, vonage_api: newVonage });
                          }}
                        />
                        Enable Vonage SMS
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={settings.vonage_api?.api_key || ''}
                        onChange={(e) => {
                          const newVonage = { ...settings.vonage_api, api_key: e.target.value };
                          setSettings({ ...settings, vonage_api: newVonage });
                        }}
                        placeholder="Enter Vonage API key"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Secret
                      </label>
                      <input
                        type="password"
                        value={settings.vonage_api?.api_secret || ''}
                        onChange={(e) => {
                          const newVonage = { ...settings.vonage_api, api_secret: e.target.value };
                          setSettings({ ...settings, vonage_api: newVonage });
                        }}
                        placeholder="Enter Vonage API secret"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Number / Sender ID
                      </label>
                      <input
                        type="text"
                        value={settings.vonage_api?.from_number || ''}
                        onChange={(e) => {
                          const newVonage = { ...settings.vonage_api, from_number: e.target.value };
                          setSettings({ ...settings, vonage_api: newVonage });
                        }}
                        placeholder="e.g., TimeGift or +1234567890"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => saveSetting('vonage_api', settings.vonage_api)}
                      disabled={saving}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Save Vonage Settings
                    </button>
                  </div>
                </div>

                {/* Groq API */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Groq AI API</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings.groq_api?.api_key || ''}
                        onChange={(e) => {
                          const newGroq = { ...settings.groq_api, api_key: e.target.value };
                          setSettings({ ...settings, groq_api: newGroq });
                        }}
                        placeholder="Enter Groq API key"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={settings.groq_api?.model || 'llama-3.3-70b-versatile'}
                        onChange={(e) => {
                          const newGroq = { ...settings.groq_api, model: e.target.value };
                          setSettings({ ...settings, groq_api: newGroq });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => saveSetting('groq_api', settings.groq_api)}
                      disabled={saving}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Save Groq Settings
                    </button>
                  </div>
                </div>

                {/* WhatsApp API */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">WhatsApp Business API</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={settings.whatsapp_api?.enabled ?? false}
                          onChange={(e) => {
                            const newWhatsApp = { ...settings.whatsapp_api, enabled: e.target.checked };
                            setSettings({ ...settings, whatsapp_api: newWhatsApp });
                          }}
                        />
                        Enable WhatsApp alerts
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings.whatsapp_api?.api_key || ''}
                        onChange={(e) => {
                          const newWhatsApp = { ...settings.whatsapp_api, api_key: e.target.value };
                          setSettings({ ...settings, whatsapp_api: newWhatsApp });
                        }}
                        placeholder="Enter WhatsApp API key"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Secret
                      </label>
                      <input
                        type="password"
                        value={settings.whatsapp_api?.api_secret || ''}
                        onChange={(e) => {
                          const newWhatsApp = { ...settings.whatsapp_api, api_secret: e.target.value };
                          setSettings({ ...settings, whatsapp_api: newWhatsApp });
                        }}
                        placeholder="Enter WhatsApp API secret"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Number
                      </label>
                      <input
                        type="text"
                        value={settings.whatsapp_api?.from_number || ''}
                        onChange={(e) => {
                          const newWhatsApp = { ...settings.whatsapp_api, from_number: e.target.value };
                          setSettings({ ...settings, whatsapp_api: newWhatsApp });
                        }}
                        placeholder="e.g., 14157386102"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => saveSetting('whatsapp_api', settings.whatsapp_api)}
                      disabled={saving}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Save WhatsApp Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Feature Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Random Gift Exchange</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow users to opt-in for random time gifting</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.random_exchange?.enabled !== false}
                    onChange={(e) => {
                      const newExchange = { ...settings.random_exchange, enabled: e.target.checked };
                      saveSetting('random_exchange', newExchange);
                    }}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Match Similar Time Amounts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Match users gifting similar time durations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.random_exchange?.match_similar_time !== false}
                    onChange={(e) => {
                      const newExchange = { ...settings.random_exchange, match_similar_time: e.target.checked };
                      saveSetting('random_exchange', newExchange);
                    }}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
