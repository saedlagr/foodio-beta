import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, CheckCircle, Clock, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CookingLoader } from "@/components/CookingLoader";

interface ProcessedImage {
  id: string;
  originalUrl: string;
  enhancedUrl?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  fileName: string;
  uploadTime: Date;
}

const Index = () => {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for completed images
  useEffect(() => {
    const checkForUpdates = async () => {
      const processingImages = processedImages.filter(img => img.status === 'processing');
      
      for (const image of processingImages) {
        try {
          // Check if the processing is complete by querying the processing_jobs table
          const { data, error } = await supabase
            .from('processing_jobs' as any)
            .select('*')
            .eq('id', image.id)
            .maybeSingle();

          if (data && (data as any).enhanced_image_url && (data as any).status === 'completed') {
            setProcessedImages(prev => 
              prev.map(img => 
                img.id === image.id 
                  ? { ...img, enhancedUrl: (data as any).enhanced_image_url, status: 'completed' }
                  : img
              )
            );
          } else if (data && (data as any).status === 'failed') {
            setProcessedImages(prev => 
              prev.map(img => 
                img.id === image.id 
                  ? { ...img, status: 'failed' }
                  : img
              )
            );
          }
        } catch (error) {
          console.error('Error checking image status:', error);
        }
      }
    };

    const interval = setInterval(checkForUpdates, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [processedImages]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Create preview URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Add to processed images list immediately
    const newImage: ProcessedImage = {
      id: Date.now().toString(),
      originalUrl: imageUrl,
      status: 'uploading',
      fileName: file.name,
      uploadTime: new Date(),
    };
    
    setProcessedImages(prev => [newImage, ...prev]);

    try {
      // Upload the image
      const result = await uploadImage(file, `Transform this food image: ${file.name}`, 'before');
      
      if (result.success && result.db_record_id) {
        // Update status to processing
        setProcessedImages(prev => 
          prev.map(img => 
            img.id === newImage.id 
              ? { ...img, id: result.db_record_id!, status: 'processing' }
              : img
          )
        );

        // Start the n8n processing (fire and forget - no waiting)
        fetch('https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: {
              jobId: result.db_record_id,
              imageUrl: result.image_url,
              message: `Transform this food image: ${file.name}`
            }
          }),
        }).catch(error => {
          console.error('Error calling webhook:', error);
          setProcessedImages(prev => 
            prev.map(img => 
              img.id === result.db_record_id! 
                ? { ...img, status: 'failed' }
                : img
            )
          );
        });

      } else {
        // Update status to failed
        setProcessedImages(prev => 
          prev.map(img => 
            img.id === newImage.id 
              ? { ...img, status: 'failed' }
              : img
          )
        );
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setProcessedImages(prev => 
        prev.map(img => 
          img.id === newImage.id 
            ? { ...img, status: 'failed' }
            : img
        )
      );
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const downloadImage = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `enhanced-${fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-6 backdrop-blur-sm border-b border-border">
          <img src="/lovable-uploads/fae6ccf8-cbb0-42c9-bb05-8b5112d87509.png" alt="Foodio" className="h-8 w-auto dark:hidden" />
          <img src="/lovable-uploads/19a613a5-687b-443f-9a7e-df9d77fbddf2.png" alt="Foodio" className="h-8 w-auto hidden dark:block" />
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Foodio AI
            </h1>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden flex flex-col max-w-6xl mx-auto w-full p-6">
          
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Transform Your Food Photos
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Upload your food images and let AI enhance them to professional quality
            </p>
            
            {/* Upload Area */}
            <Card className={`relative p-12 border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50 ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="h-16 w-16 text-primary/60" />
                <div>
                  <p className="text-xl font-semibold">Drop your food image here</p>
                  <p className="text-muted-foreground">or click to browse</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Processed Images Grid */}
          {processedImages.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Your Transformations</h3>
              
              <div className="grid gap-6">
                {processedImages.map((image) => (
                  <Card key={image.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{image.fileName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {image.uploadTime.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {image.status === 'uploading' && (
                          <>
                            <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                            <span className="text-sm text-blue-500">Uploading...</span>
                          </>
                        )}
                        {image.status === 'processing' && (
                          <>
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-500">Processing...</span>
                          </>
                        )}
                        {image.status === 'completed' && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">Complete</span>
                          </>
                        )}
                        {image.status === 'failed' && (
                          <span className="text-sm text-red-500">Failed</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Original Image */}
                      <div>
                        <h5 className="font-medium mb-2">Original</h5>
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={image.originalUrl} 
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Enhanced Image */}
                      <div>
                        <h5 className="font-medium mb-2">Enhanced</h5>
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                          {image.status === 'processing' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                              <CookingLoader isUploading={true} />
                            </div>
                          )}
                          {image.enhancedUrl ? (
                            <>
                              <img 
                                src={image.enhancedUrl} 
                                alt="Enhanced"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                onClick={() => downloadImage(image.enhancedUrl!, image.fileName)}
                                className="absolute top-2 right-2"
                                size="sm"
                                variant="secondary"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          ) : image.status === 'failed' ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              Processing failed
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              {image.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;