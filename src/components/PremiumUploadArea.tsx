import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumUploadAreaProps {
  onFileSelect: (files: File[]) => void;
  selectedImages: File[];
  onRemoveImage: (index: number) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export const PremiumUploadArea = ({ 
  onFileSelect, 
  selectedImages, 
  onRemoveImage, 
  isProcessing, 
  disabled = false 
}: PremiumUploadAreaProps) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    onFileSelect(imageFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    onFileSelect(imageFiles);
  };

  return (
    <div className="space-y-6">
      {/* Premium Upload Zone */}
      <div className="premium-upload-zone rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative group"
           onDrop={handleDrop}
           onDragOver={handleDragOver}
           onClick={() => document.getElementById('file-input')?.click()}>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl"></div>
        </div>

        {/* Upload Icon with animation */}
        <div className="relative z-10 mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Upload Text */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Drop your food images here
          </h3>
          <p className="text-gray-400 mb-4">
            or click to browse your gallery
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            {['PNG', 'JPG', 'JPEG', 'WebP'].map((format) => (
              <span key={format} className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                {format}
              </span>
            ))}
          </div>
        </div>

        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Selected Images Grid */}
      {selectedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Selected Images</h4>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
              {selectedImages.length} selected
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group/image">
                <div className="aspect-square premium-card rounded-xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="w-full h-full object-cover transform group-hover/image:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(index);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-xl">
                  <p className="text-xs text-white truncate">{image.name}</p>
                  <p className="text-xs text-gray-300">
                    {(image.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Button */}
      {selectedImages.length > 0 && (
        <Button 
          onClick={() => onFileSelect(selectedImages)}
          disabled={isProcessing || disabled}
          className="w-full h-14 text-lg font-semibold premium-button premium-gradient text-white rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
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
      )}
    </div>
  );
};