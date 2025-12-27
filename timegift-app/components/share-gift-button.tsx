'use client';

import { Share2, Instagram, Facebook, Twitter, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareGiftButtonProps {
  gift: {
    id: string;
    message: string;
    time_amount: number;
    time_unit: string;
    recipient_email?: string;
    recipient_phone?: string;
  };
  variant?: 'button' | 'icon';
}

export default function ShareGiftButton({ gift, variant = 'button' }: ShareGiftButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://timegift.6x7.gr';
  const giftUrl = `${appUrl}/gift/${gift.id}`;

  const shareText = `🎁 I just gifted ${gift.time_amount} ${gift.time_unit} of my time!\n\n"${gift.message}"\n\n#TimeGift #GiftYourTime\n${giftUrl}`;
  const shareTextShort = `🎁 I just gifted ${gift.time_amount} ${gift.time_unit} of my time! #TimeGift ${giftUrl}`;

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(giftUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'instagram':
        navigator.clipboard.writeText(shareText);
        alert('Share text copied! Open Instagram and paste it in your story or post.');
        setShowShareMenu(false);
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
      setShowShareMenu(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        {showShareMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowShareMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <button
                onClick={() => handleShare('instagram')}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Instagram</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Twitter className="w-4 h-4 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Twitter</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowShareMenu(!showShareMenu)}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
    >
      <Share2 className="w-4 h-4" />
      <span>Share Gift</span>
    </button>
  );
}










