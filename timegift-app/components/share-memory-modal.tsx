'use client';

import { useState } from 'react';
import { X, Instagram, Facebook, Twitter, Link as LinkIcon, Copy, Check } from 'lucide-react';

interface ShareMemoryModalProps {
  memory: {
    id: string;
    photo_url?: string;
    story?: string;
    gift?: {
      message?: string;
    };
    created_at?: any;
  };
  onClose: () => void;
}

export default function ShareMemoryModal({ memory, onClose }: ShareMemoryModalProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://timegift.6x7.gr';
  const memoryUrl = `${appUrl}/memories?memory=${memory.id}`;
  
  const date = memory.created_at?.toDate 
    ? memory.created_at.toDate().toLocaleDateString()
    : new Date(memory.created_at).toLocaleDateString();

  // Generate share text
  const shareText = memory.story 
    ? `💝 TimeGift Memory\n\n${memory.story}\n\n${memory.gift?.message ? `"${memory.gift.message}"` : ''}\n\n#TimeGift #GiftYourTime\n${memoryUrl}`
    : `💝 TimeGift Memory\n\n${memory.gift?.message || 'A beautiful moment together'}\n\n#TimeGift #GiftYourTime\n${memoryUrl}`;

  const shareTextShort = `💝 TimeGift Memory - ${memory.gift?.message?.substring(0, 50) || 'A beautiful moment'} #TimeGift ${memoryUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(memoryUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we copy text
        navigator.clipboard.writeText(shareText);
        alert('Share text copied! Open Instagram and paste it in your story or post.');
        return;
      
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextShort)}`;
        break;
      
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Memory</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Preview */}
          {memory.photo_url && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={memory.photo_url}
                alt="Memory"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Share Text Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share Text:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {shareText}
            </p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Facebook className="w-5 h-5" />
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center space-x-2 p-4 bg-black dark:bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Twitter className="w-5 h-5" />
              <span>Twitter</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center justify-center space-x-2 p-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <LinkIcon className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={memoryUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hashtags */}
          <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Suggested Hashtags:</p>
            <div className="flex flex-wrap gap-2">
              {['#TimeGift', '#GiftYourTime', '#TimeTogether', '#MeaningfulMoments'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    navigator.clipboard.writeText(tag);
                    alert(`${tag} copied!`);
                  }}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










