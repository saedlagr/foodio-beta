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
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground backdrop-blur-sm" onClick={() => navigate('/signup')}>
              Sign In / Sign Up
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

          {/* Demo Video Placeholder */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Demo Video Coming Soon</h3>
                <p className="text-muted-foreground text-lg max-w-md">
                  Watch how our AI transforms your food photos in seconds
                </p>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center mb-8">
            
          </div>

          {/* Enhanced CTA Section */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 border border-primary/10 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Benefits & Value Props */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    Why Choose Foodio?
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Join thousands of restaurants saving time and money with AI-powered food photography
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <div className="bg-card/30 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">90% Cost Savings</h3>
                        <p className="text-sm text-muted-foreground">Professional photos without the professional price tag</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card/30 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Instant Results</h3>
                        <p className="text-sm text-muted-foreground">Transform photos in seconds, not hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card/30 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Studio Quality</h3>
                        <p className="text-sm text-muted-foreground">Perfect lighting, angles, and presentation every time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - CTA */}
              <div className="text-center md:text-left space-y-6">
                <div className="bg-card/50 rounded-2xl p-6 border border-primary/20">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Transform Your Food Photos?</h3>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>✓ No photography experience needed</li>
                    <li>✓ Works with any smartphone camera</li>
                    <li>✓ Perfect for menus, social media & ads</li>
                    <li>✓ 100% satisfaction guarantee</li>
                  </ul>
                  
                  <Button 
                    size="lg" 
                    className="w-full px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl mb-4" 
                    onClick={() => navigate('/signup')}
                  >
                    Get Started Today
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>;
};