import { ProcessedImage } from "@/pages/Generator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Eye, RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";

interface PremiumProcessingHistoryProps {
  processedImages: ProcessedImage[];
  onDeleteImage: (imageId: string) => void;
  onRetryProcessing: (imageId: string) => void;
}

export const PremiumProcessingHistory = ({ 
  processedImages, 
  onDeleteImage, 
  onRetryProcessing 
}: PremiumProcessingHistoryProps) => {
  const getStatusIcon = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Transformed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `transformed_${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (processedImages.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center opacity-50">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No processing history yet</h3>
          <p className="text-gray-400">Your transformed images will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Processing History</h3>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
          {processedImages.length} image{processedImages.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {processedImages.map((image) => (
          <Card key={image.id} className="premium-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Original Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 premium-card rounded-xl overflow-hidden">
                    <img
                      src={image.originalUrl}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Image Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white truncate mb-1">
                        {image.originalName}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {image.timestamp.toLocaleDateString()} at {image.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor(image.status)}`}>
                        {getStatusIcon(image.status)}
                        {getStatusText(image.status)}
                      </div>
                    </div>
                  </div>

                  {/* Progress/Status Info */}
                  {image.status === 'processing' && (
                    <div className="space-y-2 mb-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${image.progress || 0}%` }}
                        />
                      </div>
                      {image.progressMessage && (
                        <p className="text-sm text-gray-400">{image.progressMessage}</p>
                      )}
                    </div>
                  )}

                  {image.status === 'error' && image.progressMessage && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{image.progressMessage}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {image.status === 'completed' && image.processedUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(image.processedUrl!, image.originalName)}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(image.processedUrl, '_blank')}
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </>
                    )}
                    
                    {image.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetryProcessing(image.id)}
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteImage(image.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Transformed Image Preview */}
                {image.status === 'completed' && image.processedUrl && (
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 premium-card rounded-xl overflow-hidden group/transformed">
                      <img
                        src={image.processedUrl}
                        alt={`Transformed ${image.originalName}`}
                        className="w-full h-full object-cover transform group-hover/transformed:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/transformed:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};