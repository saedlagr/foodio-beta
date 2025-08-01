import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumUploadArea } from "@/components/PremiumUploadArea";
import { PremiumProcessingHistory } from "@/components/PremiumProcessingHistory";
import { PremiumSettingsSidebar } from "@/components/PremiumSettingsSidebar";
import { Loader2, Sparkles } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/hooks/useTokens";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedImage {
  id: string;
  originalUrl: string;
  originalName: string;
  status: 'processing' | 'completed' | 'error';
  processedUrl?: string;
  timestamp: Date;
  supabaseFileName?: string;
  dbRecordId?: string;
  progress?: number;
  progressMessage?: string;
}

export const Generator = () => {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7";
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getUserTokens } = useTokens();
  const navigate = useNavigate();
  const [userTokens, setUserTokens] = useState<number>(0);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (user?.id) {
      getUserTokens(user.id).then(setUserTokens);
    }
  }, [user?.id, getUserTokens]);

  // Set up Supabase Realtime subscription for instant updates
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSubscription = async () => {
      // Create a channel for image processing updates
      const channel = supabase
        .channel('image-processing-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'images',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Realtime update received:', payload);
            
            const { new: newRecord, old: oldRecord } = payload;
            
            // Find the corresponding processed image
            const processedImageIndex = processedImages.findIndex(img => 
              img.dbRecordId === newRecord.id
            );
            
            if (processedImageIndex !== -1) {
              const metadata = newRecord.metadata as Record<string, unknown>;
              const updatedImage = { ...processedImages[processedImageIndex] };
              
              // Update based on processing status
              if (metadata?.processing_completed && metadata?.enhanced_image_url) {
                updatedImage.status = 'completed';
                updatedImage.processedUrl = metadata.enhanced_image_url;
                updatedImage.progressMessage = "Enhancement complete!";
                
                toast({
                  title: "🎉 Processing completed!",
                  description: "Your food image has been successfully enhanced!",
                });
                
                // Refresh tokens
                getUserTokens(user.id).then(setUserTokens);
                
              } else if (metadata?.processing_failed) {
                updatedImage.status = 'error';
                updatedImage.progressMessage = "Processing failed";
                
                toast({
                  title: "Processing failed",
                  description: metadata?.processing_error || "Image processing failed. Please try again.",
                  variant: "destructive",
                });
                
              } else if (metadata?.processing_started) {
                // Processing started - ensure status is processing
                updatedImage.status = 'processing';
                updatedImage.progressMessage = "AI processing started...";
              }
              
              // Update the specific image in the array
              setProcessedImages(prev => {
                const newImages = [...prev];
                newImages[processedImageIndex] = updatedImage;
                return newImages;
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      realtimeChannelRef.current = channel;
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [user?.id, processedImages, getUserTokens, toast]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed",
        variant: "destructive",
      });
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to process",
        variant: "destructive",
      });
      return;
    }

    // Check tokens before processing
    if (userTokens < selectedImages.length) {
      toast({
        title: "Insufficient tokens",
        description: `You need ${selectedImages.length} token(s) to process ${selectedImages.length} image(s). You have ${userTokens} tokens.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      for (const image of selectedImages) {
        // Create a new processed image entry
        const newProcessedImage: ProcessedImage = {
          id: crypto.randomUUID(),
          originalUrl: URL.createObjectURL(image),
          originalName: image.name,
          status: 'processing',
          timestamp: new Date(),
        };

        setProcessedImages(prev => [newProcessedImage, ...prev]);

        try {
          // Use the process-image function
          const formData = new FormData();
          formData.append('image', image);
          formData.append('message', 'Transform this food image to make it look more appetizing');
          formData.append('userId', user?.id || '');
          formData.append('imageType', 'before');

          console.log('Starting image processing for:', image.name);
          console.log('User ID:', user?.id);
          
          const response = await supabase.functions.invoke('process-image', {
            body: formData,
          });

          console.log('Supabase response:', response);

          if (response.error) {
            console.error('Supabase function error:', response.error);
            throw new Error(response.error.message || 'Failed to start image processing');
          }

          const result = response.data;
          console.log('Image processing started successfully:', result);

          if (!result || !result.db_record_id) {
            throw new Error('Invalid response from processing service');
          }

          // Update with the database record ID for tracking
          setProcessedImages(prev => prev.map(img => 
            img.id === newProcessedImage.id 
              ? { 
                  ...img, 
                  supabaseFileName: result.file_path,
                  processedUrl: result.image_url,
                  dbRecordId: result.db_record_id
                }
              : img
          ));

          // Start polling for completion
          pollForCompletion(newProcessedImage.id, result.db_record_id);

        } catch (error) {
          console.error("Error processing image:", error);
          setProcessedImages(prev => prev.map(img => 
            img.id === newProcessedImage.id 
              ? { ...img, status: 'error' as const }
              : img
          ));
          
          toast({
            title: "Processing failed",
            description: error instanceof Error ? error.message : "Failed to process image",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "🚀 Processing started!",
        description: `${selectedImages.length} image(s) uploaded for AI enhancement. You'll see live progress below. Processing typically takes 3-4 minutes.`,
      });

      setSelectedImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error("Error processing images:", error);
      toast({
        title: "Processing failed",
        description: "Failed to process images",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced polling with adaptive intervals and better real-time updates
  const pollForCompletion = async (imageId: string, dbRecordId: string) => {
    const maxPollingTime = 8 * 60 * 1000; // 8 minutes (reduced from 10)
    let pollingInterval = 8000; // Start with 8 seconds
    const maxPollingInterval = 30000; // Max 30 seconds
    const minPollingInterval = 3000; // Min 3 seconds
    const startTime = Date.now();
    let lastStatusUpdate = Date.now();
    let lastProgressUpdate = Date.now();
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    let processingStage = 0; // Track AI processing stages
    
    console.log(`Starting adaptive polling for image ${imageId}, db record ${dbRecordId}`);

    // AI processing stages with realistic timing
    const processingStages = [
      { duration: 60000, message: "Initializing AI processing..." },      // 0-60s
      { duration: 90000, message: "Analyzing food image composition..." }, // 60-150s
      { duration: 120000, message: "Generating enhancement prompts..." }, // 150-270s
      { duration: 180000, message: "Processing with AI models..." },       // 270-450s
      { duration: 30000, message: "Finalizing your enhanced image..." }   // 450-480s
    ];

    const getStatusMessage = (elapsedMs: number) => {
      let accumulatedTime = 0;
      for (let i = 0; i < processingStages.length; i++) {
        accumulatedTime += processingStages[i].duration;
        if (elapsedMs < accumulatedTime) {
          processingStage = i;
          return processingStages[i].message;
        }
      }
      return "Finalizing your enhanced image...";
    };

    const getAdaptivePollingInterval = (elapsedMs: number, hasError: boolean) => {
      // Increase polling interval over time to reduce server load
      const elapsedMinutes = elapsedMs / 60000;
      
      if (hasError) {
        return minPollingInterval; // Poll faster on errors
      }
      
      if (elapsedMinutes < 2) return minPollingInterval;      // Fast polling initially
      if (elapsedMinutes < 5) return 10000;                   // 10 seconds
      if (elapsedMinutes < 7) return 15000;                   // 15 seconds
      return maxPollingInterval;                              // Max 30 seconds
    };

    const updateProgressStatus = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(95, Math.floor((elapsed / maxPollingTime) * 100)); // Cap at 95%
      
      // Update status message every 20 seconds (more frequent)
      if (Date.now() - lastStatusUpdate > 20000) {
        setProcessedImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, progressMessage: getStatusMessage(elapsed) }
            : img
        ));
        lastStatusUpdate = Date.now();
      }
      
      // Update progress bar every 5 seconds
      if (Date.now() - lastProgressUpdate > 5000) {
        setProcessedImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, progress }
            : img
        ));
        lastProgressUpdate = Date.now();
      }
      
      return { elapsed, progress };
    };

    const poll = async () => {
      try {
        const { elapsed, progress } = updateProgressStatus();
        
        // Check if we've exceeded max polling time
        if (elapsed > maxPollingTime) {
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'error' as const, progressMessage: "Processing timeout - please try again" }
              : img
          ));
          toast({
            title: "Processing timeout",
            description: "Image processing took longer than expected. This may be due to high demand. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Check the database for processing completion
        console.log(`Checking status for db record ${dbRecordId}, attempt ${consecutiveErrors + 1}`);
        
        const { data, error } = await supabase
          .from('images')
          .select('metadata, created_at, updated_at')
          .eq('id', dbRecordId)
          .single();

        if (error) {
          console.error('Error checking processing status:', error);
          consecutiveErrors++;
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error(`Max consecutive errors reached for image ${imageId}`);
            setProcessedImages(prev => prev.map(img => 
              img.id === imageId 
                ? { ...img, status: 'error' as const, progressMessage: "Connection error - please check your internet and try again" }
                : img
            ));
            toast({
              title: "Connection error",
              description: "Unable to check processing status. Please check your internet connection and try again.",
              variant: "destructive",
            });
            return;
          }
          
          // Use adaptive polling on errors
          pollingInterval = getAdaptivePollingInterval(elapsed, true);
          setTimeout(poll, pollingInterval);
          return;
        }

        // Reset error counter on successful request
        consecutiveErrors = 0;
        pollingInterval = getAdaptivePollingInterval(elapsed, false);

        const metadata = data.metadata as Record<string, unknown>;
        
        if (!metadata) {
          setTimeout(poll, pollingInterval);
          return;
        }
        
        if (metadata.processing_completed && metadata.enhanced_image_url) {
          // Processing completed successfully
          console.log(`Processing completed for ${imageId}, URL: ${metadata.enhanced_image_url}`);
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { 
                  ...img, 
                  status: 'completed' as const,
                  processedUrl: metadata.enhanced_image_url as string,
                  progress: 100,
                  progressMessage: "Enhancement complete!"
                }
              : img
          ));
          
          toast({
            title: "Processing completed! 🎉",
            description: "Your food image has been successfully enhanced and made more appetizing!",
          });
          
          // Refresh user tokens
          if (user?.id) {
            getUserTokens(user.id).then(setUserTokens);
          }
          
        } else if (metadata.processing_failed) {
          // Processing failed
          console.error(`Processing failed for ${imageId}:`, metadata.processing_error);
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'error' as const, progressMessage: metadata.processing_error as string || "Processing failed" }
              : img
          ));
          
          toast({
            title: "Processing failed",
            description: metadata.processing_error as string || "Image processing failed. Please try again.",
            variant: "destructive",
          });
          
        } else {
          // Still processing - check for n8n status updates
          const n8nStatus = metadata.n8n_status || metadata.processing_status;
          if (n8nStatus && typeof n8nStatus === 'string') {
            // Use n8n status message if available
            setProcessedImages(prev => prev.map(img => 
              img.id === imageId 
                ? { ...img, progressMessage: n8nStatus }
                : img
            ));
          } else {
            // Use our staged progress messages
            setProcessedImages(prev => prev.map(img => 
              img.id === imageId 
                ? { ...img, progress, progressMessage: getStatusMessage(elapsed) }
                : img
            ));
          }
          
          setTimeout(poll, pollingInterval);
        }

      } catch (error) {
        console.error('Error during polling:', error);
        consecutiveErrors++;
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'error' as const, progressMessage: "Unexpected error occurred" }
              : img
          ));
          return;
        }
        
        pollingInterval = getAdaptivePollingInterval(Date.now() - startTime, true);
        setTimeout(poll, pollingInterval);
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 2000);
  };

  const getStatusColor = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Transformed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const imageToDelete = processedImages.find(img => img.id === imageId);
    if (!imageToDelete) return;

    try {
      // Delete from Supabase storage if fileName exists
      if (imageToDelete.supabaseFileName) {
        const { error } = await supabase.storage
          .from('image-transformations')
          .remove([imageToDelete.supabaseFileName]);
        
        if (error) {
          console.error('Error deleting from Supabase:', error);
        }
      }

      // Remove from local state
      setProcessedImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: "Image deleted",
        description: "The image has been removed from your account and storage",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the image",
        variant: "destructive",
      });
    }
    
    setDeleteImageId(null);
  };

  const handleRetryProcessing = async (imageId: string) => {
    const imageToRetry = processedImages.find(img => img.id === imageId);
    if (!imageToRetry || !imageToRetry.dbRecordId) return;

    try {
      // Reset status to processing
      setProcessedImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'processing' as const, progressMessage: "Retrying processing..." }
          : img
      ));

      // Check current status in database
      const { data, error } = await supabase
        .from('images')
        .select('metadata')
        .eq('id', imageToRetry.dbRecordId)
        .single();

      if (error) {
        throw new Error('Failed to check image status');
      }

      const metadata = data.metadata as Record<string, unknown>;
      
      if (metadata?.processing_completed && metadata?.enhanced_image_url) {
        // Image was actually completed, update UI
        setProcessedImages(prev => prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'completed' as const,
                processedUrl: metadata.enhanced_image_url,
                progressMessage: "Enhancement complete!"
              }
            : img
        ));
        
        toast({
          title: "Image found!",
          description: "Your image processing was actually completed!",
        });
      } else if (metadata?.processing_failed) {
        // Still failed, try to retrigger processing
        toast({
          title: "Still processing",
          description: "The image is still being processed. Please wait a bit longer.",
        });
      } else {
        // Restart polling
        pollForCompletion(imageId, imageToRetry.dbRecordId);
        toast({
          title: "Retry started",
          description: "Checking processing status again...",
        });
      }

    } catch (error) {
      console.error('Error retrying processing:', error);
      setProcessedImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'error' as const, progressMessage: "Retry failed" }
          : img
      ));
      
      toast({
        title: "Retry failed",
        description: "Unable to retry processing. Please try uploading again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <AnimatedBackground />
      {/* Premium Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold premium-gradient-text">Foodio</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="premium-card px-4 py-2 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-400">{userTokens} tokens</span>
              </div>
            </div>
            <Badge variant="secondary" className="premium-card px-3 py-1 border border-green-500/30 text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              Ready
            </Badge>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full premium-card border border-white/20">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        {user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}} className="text-red-400 hover:bg-red-500/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="premium-button premium-gradient text-white px-6 py-2 rounded-lg" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 premium-gradient-text">
                Transform Your Food Photography
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Professional AI-powered enhancement for your food images. Make your dishes look irresistible with our advanced technology.
              </p>
            </div>

            {/* Premium Upload Area */}
            <PremiumUploadArea
              onFileSelect={(files) => setSelectedImages(prev => [...prev, ...files])}
              selectedImages={selectedImages}
              onRemoveImage={removeImage}
              isProcessing={isProcessing}
              disabled={userTokens < selectedImages.length}
            />

            {/* Process Button (only if not handled in PremiumUploadArea) */}
            {selectedImages.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleProcess}
                  disabled={isProcessing || userTokens < selectedImages.length}
                  className="premium-button premium-gradient text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      Transform {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Premium Processing History */}
            <PremiumProcessingHistory
              processedImages={processedImages}
              onDeleteImage={handleDeleteImage}
              onRetryProcessing={handleRetryProcessing}
            />
          </div>

          {/* Premium Settings Sidebar */}
          <div>
            <PremiumSettingsSidebar />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteImageId !== null} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the image from your account and remove it from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteImageId && handleDeleteImage(deleteImageId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};