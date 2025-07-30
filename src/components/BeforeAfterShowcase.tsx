import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const showcaseItems = [
  {
    before: "/lovable-uploads/ad5239ca-2238-4f89-b1e6-5ae360b1b766.png",
    after: "/lovable-uploads/d25a559b-3657-47a0-b003-8bf3f96a6070.png",
    title: "Ramen Enhancement",
    description: "Transform casual food photos into restaurant-quality masterpieces"
  },
  {
    before: "/lovable-uploads/500b571c-e7f4-4f75-9e3f-818ba13519a9.png", 
    after: "/lovable-uploads/9ec6652e-eb8d-4eb6-8495-c1b80c3197e8.png",
    title: "Loaded Fries Upgrade",
    description: "Elevate your comfort food with professional styling"
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const currentItem = showcaseItems[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          See the Magic in Action
        </h2>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          Watch ordinary photos transform into extraordinary visuals with AI-powered enhancement
        </p>
      </div>

      <div className="relative">
        {/* Main Showcase */}
        <div className="bg-background/50 backdrop-blur-sm rounded-3xl border shadow-2xl overflow-hidden animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[500px]">
            {/* Before Section */}
            <div className="relative group bg-muted/10">
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold border shadow-sm">
                  Before
                </div>
              </div>
              <div className="h-full flex items-center justify-center p-8">
                <div className="relative w-full max-w-md">
                  <img
                    src={currentItem.before}
                    alt="Before enhancement"
                    className="w-full h-auto rounded-2xl shadow-lg transition-all duration-500 group-hover:shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            {/* After Section */}
            <div className="relative group bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="absolute top-6 right-6 z-10">
                <div className="bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-primary-foreground flex items-center gap-2 shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  Enhanced
                </div>
              </div>
              <div className="h-full flex items-center justify-center p-8">
                <div className="relative w-full max-w-md">
                  <img
                    src={currentItem.after}
                    alt="After enhancement"
                    className="w-full h-auto rounded-2xl shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105"
                  />
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Footer */}
          <div className="p-8 bg-gradient-to-r from-background to-muted/30 border-t">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">{currentItem.title}</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">{currentItem.description}</p>
              
              {/* Try Now Button */}
              <Button className="mt-6 px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Try This Enhancement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
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
                    ? 'w-12 h-3 bg-primary shadow-lg' 
                    : 'w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-125'
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