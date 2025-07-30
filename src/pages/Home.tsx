import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Camera, Sparkles, Upload, ImageIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  // Animated title cycling
  const titles = [{
    text: "From",
    highlight: "Phone to Professional",
    text2: "in Minutes"
  }, {
    text: "Every",
    highlight: "Dish Deserves",
    text2: "to Look Delicious"
  }, {
    text: "Professional",
    highlight: "Food Photography",
    text2: "Powered by AI"
  }, {
    text: "Transform Any Photo",
    highlight: "Into Marketing",
    text2: "Gold"
  }, {
    text: "Studio-Quality Photos,",
    highlight: "Zero Studio",
    text2: "Required"
  }, {
    text: "Where Amateur Photos",
    highlight: "Become Professional",
    text2: "Assets"
  }, {
    text: "AI-Perfect Results,",
    highlight: "Human-Perfect",
    text2: "Guarantee"
  }, {
    text: "Stop Losing Customers to",
    highlight: "Better-Looking",
    text2: "Food Photos"
  }, {
    text: "Scale Your Photography",
    highlight: "Without Scaling",
    text2: "Your Budget"
  }];
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTitleIndex(prev => (prev + 1) % titles.length);
        setIsAnimating(false);
      }, 500);
    }, 4500);
    return () => clearInterval(interval);
  }, [titles.length]);
  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      // Navigate to chat interface with the file and mode
      navigate('/chat', {
        state: {
          initialFile: file,
          mode: isVideo ? 'video' : 'photo'
        }
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  return <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center p-8 backdrop-blur-sm">
          <img src="/lovable-uploads/fae6ccf8-cbb0-42c9-bb05-8b5112d87509.png" alt="Foodio" className="h-10 w-auto dark:hidden" />
          <img src="/lovable-uploads/19a613a5-687b-443f-9a7e-df9d77fbddf2.png" alt="Foodio" className="h-10 w-auto hidden dark:block" />
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Community</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Enterprise</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pricing</a>
            <ThemeToggle />
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground backdrop-blur-sm">
              Sign In
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-light mb-4 text-foreground leading-tight min-h-[1.2em] flex flex-col items-center justify-center">
              <span className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 transform -translate-y-4 scale-95' : 'opacity-100 transform translate-y-0 scale-100'}`}>
                <span className="text-foreground">{titles[currentTitleIndex].text} </span>
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  {titles[currentTitleIndex].highlight}
                </span>
                <span className="text-foreground"> {titles[currentTitleIndex].text2}</span>
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform smartphone food photos into studio-quality images and videos using AI—90% cheaper than traditional photography with guaranteed perfect results.
            </p>
          </div>


          {/* Mode Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-lg">
              <div className="flex">
                <button 
                  onClick={() => setIsVideo(false)} 
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${!isVideo ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Photo Enhancement
                </button>
                <button 
                  onClick={() => setIsVideo(true)} 
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${isVideo ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Video Creation
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full max-w-2xl mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div 
                className={`relative bg-white/5 backdrop-blur-xl border-2 border-dashed rounded-2xl p-12 shadow-2xl transition-all duration-300 cursor-pointer ${
                  isDragOver ? 'border-primary/50 bg-primary/5' : 'border-white/20 hover:border-primary/30'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {isVideo ? "Upload to Create Video" : "Upload to Enhance Photo"}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your food photo here, or click to browse
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    <span>Supports JPG, PNG, WebP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>;
};