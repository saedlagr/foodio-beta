import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const showcaseItems = [
  {
    before: "/lovable-uploads/d25a559b-3657-47a0-b003-8bf3f96a6070.png",
    after: "/lovable-uploads/ad5239ca-2238-4f89-b1e6-5ae360b1b766.png",
    title: "Ramen Enhancement",
    description: "Transform your casual food photos into restaurant-quality masterpieces"
  },
  {
    before: "/lovable-uploads/500b571c-e7f4-4f75-9e3f-818ba13519a9.png", 
    after: "/lovable-uploads/a7f85fda-bdce-465c-a1bd-e8efa2366be1.png",
    title: "Gourmet Plating",
    description: "Elevate your dishes with professional styling and presentation"
  },
  {
    before: "/lovable-uploads/9e551e8d-7e1d-4317-99d6-72038809c886.png",
    after: "/lovable-uploads/75646a35-0334-4073-96a5-61c18f77a77d.png", 
    title: "Burger Perfection",
    description: "Make every meal look irresistibly delicious"
  }
];

export const BeforeAfterShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const currentItem = showcaseItems[currentIndex];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-3">
          See the Magic in Action
        </h2>
        <p className="text-muted-foreground text-lg">
          Watch ordinary photos transform into extraordinary visuals
        </p>
      </div>

      <div className="relative bg-card rounded-2xl shadow-2xl overflow-hidden border">
        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost" 
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Before Section */}
          <div className="relative group">
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-muted/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                Before
              </div>
            </div>
            <div 
              className="relative overflow-hidden bg-muted/20"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={currentItem.before}
                alt="Before enhancement"
                className={`w-full h-80 lg:h-96 object-cover transition-all duration-500 ${
                  isHovering ? 'scale-105 brightness-75' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/10" />
            </div>
          </div>

          {/* After Section */}
          <div className="relative group">
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                After
              </div>
            </div>
            <div 
              className="relative overflow-hidden"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={currentItem.after}
                alt="After enhancement"
                className={`w-full h-80 lg:h-96 object-cover transition-all duration-500 ${
                  isHovering ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/10" />
            </div>
          </div>
        </div>

        {/* Content Footer */}
        <div className="p-6 bg-gradient-to-r from-background to-muted/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
            <p className="text-muted-foreground">{currentItem.description}</p>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {showcaseItems.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};