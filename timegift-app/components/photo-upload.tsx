'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { enhanceImage } from '@/utils/ai/groq';

interface PhotoUploadProps {
  onUploadComplete: (url: string) => void;
  onClose: () => void;
}

export default function PhotoUpload({ onUploadComplete, onClose }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (enhance: boolean = false) => {
    if (!file) return;

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gift-cards/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gift-cards')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gift-cards')
        .getPublicUrl(filePath);

      let finalUrl = publicUrl;

      // Optional AI enhancement
      if (enhance) {
        setEnhancing(true);
        try {
          // Get Groq API settings
          const { data: settings } = await supabase
            .from('admin_settings')
            .select('setting_value')
            .eq('setting_key', 'groq_api')
            .single();

          const groqConfig = settings?.setting_value;

          if (groqConfig?.api_key) {
            const result = await enhanceImage(
              publicUrl,
              'Enhance this handwritten note for a beautiful gift card',
              groqConfig.api_key,
              groqConfig.model
            );

            if (result.success && result.enhancedUrl) {
              finalUrl = result.enhancedUrl;
            }
          }
        } catch (error) {
          console.error('Enhancement error:', error);
          // Continue with unenhanced image
        } finally {
          setEnhancing(false);
        }
      }

      onUploadComplete(finalUrl);
    } catch (error: any) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Photo Card</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-pink-500 dark:hover:border-pink-500 transition-colors"
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Click to upload a photo
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a handwritten note or image for your gift card
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleUpload(false)}
                disabled={uploading || enhancing}
                className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ImageIcon className="w-5 h-5" />
                <span>{uploading ? 'Uploading...' : 'Use as is'}</span>
              </button>
              <button
                onClick={() => handleUpload(true)}
                disabled={uploading || enhancing}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{enhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Choose different photo
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>💡 Tip:</strong> Upload a photo of a handwritten note to add a personal touch.
            AI enhancement will stylize and improve the image quality.
          </p>
        </div>
      </div>
    </div>
  );
}
