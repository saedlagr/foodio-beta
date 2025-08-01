import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Loader2, Upload, Image as ImageIcon, Settings, Zap, X, Trash2, User, LogOut } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const webhookUrl = "https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7";
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

          const response = await supabase.functions.invoke('process-image', {
            body: formData,
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          const result = response.data;
          console.log('Image processing started:', result);

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

  const pollForCompletion = async (imageId: string, dbRecordId: string) => {
    const maxPollingTime = 8 * 60 * 1000; // 8 minutes (increased from 5)
    const pollingInterval = 15000; // 15 seconds (increased from 10)
    const startTime = Date.now();
    let lastStatusUpdate = Date.now();
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    // Enhanced status messages based on elapsed time
    const getStatusMessage = (elapsedMs: number) => {
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      const remainingMinutes = Math.max(0, Math.ceil((maxPollingTime - elapsedMs) / 60000));
      
      if (elapsedMinutes < 1) return "Initializing AI processing...";
      if (elapsedMinutes < 2) return "Analyzing food image composition...";
      if (elapsedMinutes < 3) return "Generating enhancement prompts...";
      if (elapsedMinutes < 4) return "Processing with AI models...";
      if (remainingMinutes > 2) return `Still processing... (~${remainingMinutes}min remaining)`;
      return "Finalizing your enhanced image...";
    };

    const updateProgressStatus = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / maxPollingTime) * 100));
      
      // Update status message every 30 seconds
      if (Date.now() - lastStatusUpdate > 30000) {
        setProcessedImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, progressMessage: getStatusMessage(elapsed) }
            : img
        ));
        lastStatusUpdate = Date.now();
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
            description: "Image processing took too long. This may be due to high demand. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Check the database for processing completion
        const { data, error } = await supabase
          .from('images')
          .select('metadata')
          .eq('id', dbRecordId)
          .single();

        if (error) {
          console.error('Error checking processing status:', error);
          consecutiveErrors++;
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            setProcessedImages(prev => prev.map(img => 
              img.id === imageId 
                ? { ...img, status: 'error' as const, progressMessage: "Connection error - please check your internet" }
                : img
            ));
            toast({
              title: "Connection error",
              description: "Unable to check processing status. Please check your internet connection.",
              variant: "destructive",
            });
            return;
          }
          
          setTimeout(poll, pollingInterval);
          return;
        }

        // Reset error counter on successful request
        consecutiveErrors = 0;

        const metadata = data.metadata as Record<string, unknown>;
        
        if (metadata?.processing_completed && metadata?.enhanced_image_url) {
          // Processing completed successfully - update with the enhanced image URL
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
            title: "Processing completed! 🎉",
            description: "Your food image has been successfully enhanced and made more appetizing!",
          });
          
          // Refresh user tokens
          if (user?.id) {
            getUserTokens(user.id).then(setUserTokens);
          }
          
        } else if (metadata?.processing_failed) {
          // Processing failed
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'error' as const, progressMessage: "Processing failed" }
              : img
          ));
          
          toast({
            title: "Processing failed",
            description: metadata?.processing_error || "Image processing failed. Please try again.",
            variant: "destructive",
          });
          
        } else {
          // Still processing - update progress and continue polling
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, progress: progress, progressMessage: getStatusMessage(elapsed) }
              : img
          ));
          
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
        
        setTimeout(poll, pollingInterval);
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 3000);
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
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/592c6a0e-acaf-4769-a4e1-d4b0a60ad014.png" alt="Foodio" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-primary/50 text-primary">
              {userTokens} tokens
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Ready
            </Badge>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Upload Images</Label>
                    <div 
                      className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Drop images here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Supports PNG, JPG, JPEG, WebP
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Selected Images Preview */}
                  {selectedImages.length > 0 && (
                    <div>
                      <Label>Selected Images ({selectedImages.length})</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {image.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleProcess} 
                    disabled={isProcessing || selectedImages.length === 0}
                    className="w-full h-12 text-lg font-medium"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing {selectedImages.length} image(s)...
                      </>
                    ) : (
                      <>
                        Transform Images
                        <Zap className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processed Images History */}
            {processedImages.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Processing History</h3>
                  <div className="space-y-4">
                     {processedImages.map((image) => (
                       <div key={image.id} className="p-4 border rounded-lg">
                         <div className="flex items-center gap-4 mb-3">
                           <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                             <img
                               src={image.originalUrl}
                               alt={image.originalName}
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="font-medium truncate">{image.originalName}</p>
                             <p className="text-sm text-muted-foreground">
                               {image.timestamp.toLocaleTimeString()}
                             </p>
                           </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(image.status)}`} />
                                <span className="text-sm font-medium">{getStatusText(image.status)}</span>
                                
                                {/* Retry button for failed images */}
                                {image.status === 'error' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetryProcessing(image.id)}
                                    className="ml-2 h-8 px-3 text-xs"
                                  >
                                    Retry
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteImageId(image.id)}
                                  className="ml-2 p-1 h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Progress indicator for processing images */}
                              {image.status === 'processing' && (
                                <div className="space-y-2">
                                  {image.progress !== undefined && (
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${image.progress}%` }}
                                      />
                                    </div>
                                  )}
                                  {image.progressMessage && (
                                    <p className="text-xs text-muted-foreground">
                                      {image.progressMessage}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* Error message for failed images */}
                              {image.status === 'error' && image.progressMessage && (
                                <p className="text-xs text-red-400">
                                  {image.progressMessage}
                                </p>
                              )}
                            </div>
                         </div>
                         
                         {/* Show transformed image when completed */}
                         {image.status === 'completed' && image.processedUrl && (
                           <div className="mt-4">
                             <Label className="text-sm font-medium text-green-600">Transformed Image:</Label>
                             <div className="mt-2 w-full max-w-md bg-muted rounded-lg overflow-hidden">
                               <img
                                 src={image.processedUrl}
                                 alt={`Transformed ${image.originalName}`}
                                 className="w-full h-auto object-cover"
                               />
                             </div>
                           </div>
                         )}
                       </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4" />
                  <h3 className="font-semibold">Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Supported Formats</Label>
                    <div className="mt-2 space-y-1">
                      {['PNG', 'JPG', 'JPEG', 'WebP'].map((format) => (
                        <div key={format} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm text-muted-foreground">{format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">How it works</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p>Upload one or more images</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p>Click transform to process your images</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p>Get your transformed images back</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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