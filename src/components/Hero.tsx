
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, ShoppingCart } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#333333] text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#00CFCF] rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#7ED321] rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#00CFCF] rounded-full blur-md animate-bounce delay-500"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold tracking-wider mb-4 bg-gradient-to-r from-[#00CFCF] to-[#7ED321] bg-clip-text text-transparent">
              FUTUREATS
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
              Smart Vending. Smarter Business.
            </p>
          </div>
          
          {/* Key Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Zap className="w-12 h-12 text-[#00CFCF] mb-4" />
              <h3 className="text-lg font-semibold mb-2">IoT-Enabled</h3>
              <p className="text-gray-400 text-sm">Real-time monitoring and automated inventory management</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <BarChart3 className="w-12 h-12 text-[#00CFCF] mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Driven</h3>
              <p className="text-gray-400 text-sm">Predictive analytics for optimal product curation</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <ShoppingCart className="w-12 h-12 text-[#00CFCF] mb-4" />
              <h3 className="text-lg font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-400 text-sm">Frictionless cashless checkout experiences</p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-[#00CFCF] hover:bg-[#00B8B8] text-[#1A1A1A] font-semibold px-8 py-4 text-lg">
              Explore Solutions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-[#00CFCF] text-[#00CFCF] hover:bg-[#00CFCF] hover:text-[#1A1A1A] px-8 py-4 text-lg">
              Watch Demo
            </Button>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-[#00CFCF] rounded-full p-1">
              <div className="w-1 h-3 bg-[#00CFCF] rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
