import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const showcaseItems = [
  {
    before: "/lovable-uploads/d25a559b-3657-47a0-b003-8bf3f96a6070.png",
    after: "/lovable-uploads/ad5239ca-2238-4f89-b1e6-5ae360b1b766.png",
    beforeLabel: "iPhone pic",
    afterLabel: "DoorDash thumbnail"
  },
  {
    before: "/lovable-uploads/9ec6652e-eb8d-4eb6-8495-c1b80c3197e8.png", 
    after: "/lovable-uploads/500b571c-e7f4-4f75-9e3f-818ba13519a9.png",
    beforeLabel: "Your photo",
    afterLabel: "Menu photo"
  },
  {
    before: "/lovable-uploads/9e551e8d-7e1d-4317-99d6-72038809c886.png",
    after: "/lovable-uploads/75646a35-0334-4073-96a5-61c18f77a77d.png", 
    beforeLabel: "Casual shot",
    afterLabel: "Website hero"
  }
];

export const BeforeAfterShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const currentItem = showcaseItems[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="relative">
        {/* Main Showcase - Side by Side Layout */}
        <div className="bg-background/50 backdrop-blur-sm rounded-3xl border shadow-2xl overflow-hidden animate-fade-in">
          <div className="grid grid-cols-2 gap-0 min-h-[600px]">
            
            {/* Before Section - White Background */}
            <div className="relative bg-white flex flex-col">
              <div className="bg-gray-100 px-8 py-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 text-center">BEFORE</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="relative w-full max-w-lg mb-4">
                  <img
                    src={currentItem.before}
                    alt="Before enhancement"
                    className="w-full h-auto rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl"
                  />
                </div>
                <p className="text-gray-600 font-medium text-lg">{currentItem.beforeLabel}</p>
              </div>
            </div>

            {/* After Section - Orange Background */}
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 border-b border-orange-300">
                <h3 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  AFTER
                </h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="relative w-full max-w-lg mb-4">
                  <img
                    src={currentItem.after}
                    alt="After enhancement"
                    className="w-full h-auto rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105"
                  />
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-400/20 to-orange-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-lg" />
                </div>
                <p className="text-orange-800 font-semibold text-lg">{currentItem.afterLabel}</p>
              </div>
            </div>
            </div>
          </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            size="lg"
            className="px-6 py-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>

          {/* Dots Indicator */}
          <div className="flex gap-3">
            {showcaseItems.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex 
                    ? 'w-12 h-3 bg-orange-500 shadow-lg' 
                    : 'w-3 h-3 bg-muted-foreground/30 hover:bg-orange-300 hover:scale-125'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="lg"
            className="px-6 py-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={nextSlide}
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};