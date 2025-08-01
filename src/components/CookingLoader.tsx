import { useState, useEffect } from "react";
import { Sparkles, Camera, Wand2 } from "lucide-react";

const enhancementSteps = [
  "Analyzing image composition...",
  "Enhancing colors and contrast...", 
  "Optimizing lighting and shadows...",
  "Refining details and textures...",
  "Applying final touches..."
];

export const CookingLoader = ({ isUploading }: { isUploading: boolean }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isUploading) return;

    // Cycle through steps every 3 seconds
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % enhancementSteps.length);
    }, 3000);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.5;
        return newProgress >= 100 ? 0 : newProgress;
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isUploading]);

  if (!isUploading) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Main animation circle */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        
        {/* Animated progress ring */}
        <div className="absolute inset-0 w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-primary animate-spin"
              strokeDasharray="163"
              strokeDashoffset={163 - (163 * progress) / 100}
              style={{ 
                transition: 'stroke-dashoffset 0.3s ease',
                animation: 'spin 2s linear infinite'
              }}
            />
          </svg>
        </div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Wand2 className="w-6 h-6 text-primary animate-pulse" />
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-primary/60 animate-ping" />
          </div>
        </div>
      </div>

      {/* Progress text */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground animate-fade-in" key={currentStep}>
          {enhancementSteps[currentStep]}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};