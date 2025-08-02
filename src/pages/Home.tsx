import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Camera, Sparkles, Upload, ImageIcon } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
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
  return <div className="min-h-screen text-white relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center p-6 backdrop-blur-sm border-b border-white/10">
          <img src="/lovable-uploads/592c6a0e-acaf-4769-a4e1-d4b0a60ad014.png" alt="Foodio" className="h-12 w-auto" />
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium">How It Works</a>
            <a href="#showcase" className="text-muted-foreground hover:text-primary transition-colors font-medium">Gallery</a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pricing</a>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 font-medium" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-light mb-6 text-foreground leading-tight min-h-[1.2em] flex flex-col items-center justify-center">
              <span className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 transform -translate-y-4 scale-95' : 'opacity-100 transform translate-y-0 scale-100'}`}>
                <span className="text-foreground">{titles[currentTitleIndex].text} </span>
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  {titles[currentTitleIndex].highlight}
                </span>
                <span className="text-foreground"> {titles[currentTitleIndex].text2}</span>
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Transform smartphone food photos into studio-quality images using AI. Create warm, authentic visuals that make customers crave your dishes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold" onClick={() => navigate('/signup')}>
                Try It Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold">
                View Gallery
              </Button>
            </div>
          </div>

          {/* Feature Showcase */}
          <div id="features" className="mb-20 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Create Warm, Authentic Food Photos</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card/30 rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Studio-Quality Results</h3>
                <p className="text-sm text-muted-foreground">Perfect lighting, composition, and presentation every time</p>
              </div>
              
              <div className="bg-card/30 rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Natural Lighting</h3>
                <p className="text-sm text-muted-foreground">Warm, appetizing lighting that makes food look irresistible</p>
              </div>
              
              <div className="bg-card/30 rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Instant Processing</h3>
                <p className="text-sm text-muted-foreground">Transform photos in seconds, not hours or days</p>
              </div>
              
              <div className="bg-card/30 rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Professional Styling</h3>
                <p className="text-sm text-muted-foreground">AI-powered composition and styling expertise</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div id="how-it-works" className="mb-20 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Upload Your Photo</h3>
                <p className="text-sm text-muted-foreground">Take a photo with any smartphone and upload it instantly</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Processing</h3>
                <p className="text-sm text-muted-foreground">Our AI analyzes and enhances your photo with professional techniques</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Download & Use</h3>
                <p className="text-sm text-muted-foreground">Get your studio-quality photo ready for menus, social media, and ads</p>
              </div>
            </div>
          </div>

          {/* Before & After Gallery */}
          <div id="showcase" className="mb-20 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Amazing Transformations</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card/30 rounded-xl overflow-hidden border border-primary/10">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-muted-foreground">Before</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-1">Amateur Food Photo</h4>
                  <p className="text-sm text-muted-foreground">Transformed into professional quality</p>
                </div>
              </div>
              
              <div className="bg-card/30 rounded-xl overflow-hidden border border-primary/10">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-muted-foreground">After</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-1">Studio-Quality Result</h4>
                  <p className="text-sm text-muted-foreground">Perfect lighting and composition</p>
                </div>
              </div>
              
              <div className="bg-card/30 rounded-xl overflow-hidden border border-primary/10">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-muted-foreground">Before</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-1">Casual Restaurant Shot</h4>
                  <p className="text-sm text-muted-foreground">Elevated to premium standard</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold">
                View More Examples
              </Button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12 border border-primary/20 backdrop-blur-sm text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Start Creating Amazing Food Photos Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of restaurants and food businesses transforming their visual presence with AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold" onClick={() => navigate('/signup')}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold">
                Watch Demo
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>;
};