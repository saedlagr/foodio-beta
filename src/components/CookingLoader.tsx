import { useState, useEffect } from "react";
import { ChefHat, Flame, Clock, Sparkles } from "lucide-react";

const cookingPuns = [
  "Whisking up something amazing...",
  "Seasoning your image to perfection...", 
  "Letting flavors develop...",
  "Cooking up a visual feast...",
  "Adding a pinch of AI magic...",
  "Simmering your photo...",
  "Plating your masterpiece...",
  "Garnishing with excellence...",
  "Reducing to perfection...",
  "Caramelizing those details...",
  "Marinating in creativity...",
  "Dicing up the competition...",
  "Stirring in some love...",
  "Basting with brilliance..."
];

const cookingSteps = [
  { icon: ChefHat, text: "Prepping ingredients", duration: 2000 },
  { icon: Flame, text: "Heating things up", duration: 3000 },
  { icon: Clock, text: "Letting it cook", duration: 4000 },
  { icon: Sparkles, text: "Final touches", duration: 2000 }
];

export const CookingLoader = ({ isUploading }: { isUploading: boolean }) => {
  const [currentPun, setCurrentPun] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isUploading) return;

    // Cycle through puns every 2 seconds
    const punInterval = setInterval(() => {
      setCurrentPun((prev) => (prev + 1) % cookingPuns.length);
    }, 2000);

    // Progress through cooking steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % cookingSteps.length);
    }, 3000);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev + 2) % 100);
    }, 100);

    return () => {
      clearInterval(punInterval);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isUploading]);

  if (!isUploading) return null;

  const CurrentIcon = cookingSteps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
              <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
            </div>
            {/* Cooking steam animation */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-gradient-to-t from-orange-300 to-transparent rounded-full animate-pulse opacity-60"
                    style={{ 
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Chef AI at Work
          </h3>
          <p className="text-muted-foreground text-sm">
            {cookingSteps[currentStep].text}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Cooking Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cooking Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Pan */}
            <div className="w-24 h-12 bg-gray-600 rounded-b-full border-t-4 border-gray-700 relative">
              {/* Handle */}
              <div className="absolute -right-6 top-1 w-8 h-2 bg-gray-600 rounded-r-full" />
              
              {/* Cooking bubbles */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-orange-300 rounded-full animate-ping opacity-60"
                    style={{ 
                      animationDelay: `${i * 0.4}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Fire underneath */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-4 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-t-full animate-pulse"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cooking Pun */}
        <div className="text-center">
          <p className="text-primary font-medium animate-fade-in" key={currentPun}>
            {cookingPuns[currentPun]}
          </p>
        </div>

        {/* Floating Ingredients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + (i % 2)}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};