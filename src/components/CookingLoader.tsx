import { useState, useEffect } from "react";
import { ChefHat, Flame, Clock, Sparkles, Utensils, Eye, CheckCircle2 } from "lucide-react";

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
  "Basting with brilliance...",
  "Slow cooking for the best results...",
  "Patience makes the perfect dish...",
  "Great food takes time...",
  "Tenderizing every pixel...",
  "Infusing flavors slowly...",
  "Creating a work of art...",
  "Almost ready to serve...",
  "Fine-tuning the recipe...",
  "Adding the secret sauce...",
  "Perfecting the presentation..."
];

// 2-minute (120 seconds) cooking process with proper culinary order
const cookingSteps = [
  { 
    icon: ChefHat, 
    title: "Prep Work", 
    pun: "Chopping pixels to perfection...", 
    duration: 15000, // 15 seconds
    description: "Preparing ingredients"
  },
  { 
    icon: Sparkles, 
    title: "Seasoning", 
    pun: "Sprinkling AI magic seasoning...", 
    duration: 15000, // 15 seconds
    description: "Seasoning before cooking"
  },
  { 
    icon: Flame, 
    title: "Heating Up", 
    pun: "Firing up the AI ovens...", 
    duration: 15000, // 15 seconds
    description: "Getting the pan ready"
  },
  { 
    icon: Utensils, 
    title: "Cooking", 
    pun: "Searing in those delicious details...", 
    duration: 50000, // 50 seconds - main cooking phase
    description: "The main cooking process"
  },
  { 
    icon: Clock, 
    title: "Resting", 
    pun: "Letting it rest like a fine steak...", 
    duration: 15000, // 15 seconds
    description: "Letting flavors settle"
  },
  { 
    icon: Eye, 
    title: "Garnishing", 
    pun: "Adding the finishing touches...", 
    duration: 7000, // 7 seconds
    description: "Final artistic touches"
  },
  { 
    icon: CheckCircle2, 
    title: "Plating", 
    pun: "Bon appétit! Your masterpiece is served...", 
    duration: 3000, // 3 seconds
    description: "Ready to serve!"
  }
];

export const CookingLoader = ({ isUploading }: { isUploading: boolean }) => {
  const [currentPun, setCurrentPun] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStepProgress, setCurrentStepProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    if (!isUploading) {
      setCurrentStep(0);
      setCurrentStepProgress(0);
      setTotalElapsed(0);
      return;
    }

    // Cycle through puns every 3 seconds
    const punInterval = setInterval(() => {
      setCurrentPun((prev) => (prev + 1) % cookingPuns.length);
    }, 3000);

    // Track step progress and transitions
    const progressInterval = setInterval(() => {
      setTotalElapsed((prev) => {
        const newElapsed = prev + 100;
        
        // Calculate which step we should be in
        let accumulatedTime = 0;
        let stepIndex = 0;
        
        for (let i = 0; i < cookingSteps.length; i++) {
          if (newElapsed <= accumulatedTime + cookingSteps[i].duration) {
            stepIndex = i;
            break;
          }
          accumulatedTime += cookingSteps[i].duration;
          stepIndex = i + 1;
        }
        
        // Update current step if it changed
        if (stepIndex !== currentStep && stepIndex < cookingSteps.length) {
          setCurrentStep(stepIndex);
          setCurrentStepProgress(0);
        } else if (stepIndex < cookingSteps.length) {
          // Update progress within current step
          const stepElapsed = newElapsed - accumulatedTime;
          const stepProgress = (stepElapsed / cookingSteps[stepIndex].duration) * 100;
          setCurrentStepProgress(Math.min(stepProgress, 100));
        }
        
        return newElapsed;
      });
    }, 100);

    return () => {
      clearInterval(punInterval);
      clearInterval(progressInterval);
    };
  }, [isUploading, currentStep]);

  if (!isUploading) return null;

  const CurrentIcon = cookingSteps[currentStep]?.icon || ChefHat;
  const currentStepData = cookingSteps[currentStep] || cookingSteps[0];
  const totalDuration = cookingSteps.reduce((sum, step) => sum + step.duration, 0);
  const overallProgress = Math.min((totalElapsed / totalDuration) * 100, 100);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4">
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
            Chef AI Kitchen
          </h3>
          <p className="text-muted-foreground text-sm">
            {currentStepData.description}
          </p>
        </div>

        {/* Dominos-Style Step Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {cookingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isUpcoming = index > currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center relative">
                  {/* Connection Line */}
                  {index < cookingSteps.length - 1 && (
                    <div 
                      className={`absolute left-8 top-4 h-0.5 w-8 transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                  
                  {/* Step Circle */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-orange-500 text-white animate-pulse' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  
                  {/* Step Label */}
                  <span className={`text-xs mt-2 text-center transition-all duration-500 ${
                    isCurrent ? 'text-orange-500 font-semibold' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Current Step Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{currentStepData.title}</span>
              <span>{Math.round(currentStepProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${currentStepProgress}%` }}
              />
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
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

        {/* Current Step Pun */}
        <div className="text-center">
          <p className="text-primary font-medium animate-fade-in" key={currentPun}>
            {currentStepData.pun}
          </p>
          <p className="text-xs text-muted-foreground mt-2" key={`pun-${currentPun}`}>
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