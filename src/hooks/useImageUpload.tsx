import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UploadResult {
  success: boolean;
  message: string;
  image_id?: string;
  image_url?: string;
  tokens_remaining?: number;
  error?: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, message?: string, imageType: 'before' | 'after' = 'before'): Promise<UploadResult> => {
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('message', message || `Process this ${imageType} food image: ${file.name}`);
      formData.append('userId', 'user-session-' + Date.now());
      formData.append('imageType', imageType);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Upload to Supabase edge function
      const response = await fetch('https://ifqsauluskawtdanthpg.supabase.co/functions/v1/process-image', {
        method: 'POST',
        headers,
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Image Uploaded Successfully",
          description: `${file.name} has been processed and stored. ${result.tokens_remaining} tokens remaining.`,
          duration: 3000,
        });
        return result;
      } else {
        const error = result.error || 'Failed to upload image';
        toast({
          title: "Upload Failed",
          description: error,
          variant: "destructive",
          duration: 3000,
        });
        return { success: false, message: error, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      return { success: false, message: errorMessage, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const searchImages = async (query: string, userId?: string) => {
    try {
      const response = await fetch('https://ifqsauluskawtdanthpg.supabase.co/functions/v1/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          user_id: userId,
          match_threshold: 0.7,
          match_count: 10
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error searching images:', error);
      return { success: false, error: 'Failed to search images' };
    }
  };

  return {
    uploadImage,
    searchImages,
    isUploading
  };
};