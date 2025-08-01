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

  useEffect(() => {
    if (user?.id) {
      getUserTokens(user.id).then(setUserTokens);
    }
  }, [user?.id, getUserTokens]);

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
        title: "Images processing started",
        description: `${selectedImages.length} image(s) uploaded and sent for transformation. Processing may take 3-4 minutes.`,
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
    const maxPollingTime = 5 * 60 * 1000; // 5 minutes
    const pollingInterval = 10000; // 10 seconds
    const startTime = Date.now();

    const poll = async () => {
      try {
        // Check if we've exceeded max polling time
        if (Date.now() - startTime > maxPollingTime) {
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'error' as const }
              : img
          ));
          toast({
            title: "Processing timeout",
            description: "Image processing took too long and was marked as failed",
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
          setTimeout(poll, pollingInterval);
          return;
        }

        const metadata = data.metadata as any;
        
        if (metadata?.processing_completed) {
          // Processing completed successfully
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'completed' as const }
              : img
          ));
          
          toast({
            title: "Processing completed",
            description: "Your image has been successfully enhanced!",
          });
          
          // Refresh user tokens
          if (user?.id) {
            getUserTokens(user.id).then(setUserTokens);
          }
          
        } else if (metadata?.processing_failed) {
          // Processing failed
          setProcessedImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, status: 'error' as const }
              : img
          ));
          
          toast({
            title: "Processing failed",
            description: metadata?.processing_error || "Image processing failed",
            variant: "destructive",
          });
          
        } else {
          // Still processing, continue polling
          setTimeout(poll, pollingInterval);
        }

      } catch (error) {
        console.error('Error during polling:', error);
        setTimeout(poll, pollingInterval);
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 5000);
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
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(image.status)}`} />
                              <span className="text-sm font-medium">{getStatusText(image.status)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteImageId(image.id)}
                                className="ml-2 p-1 h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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