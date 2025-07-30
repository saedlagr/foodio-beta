import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const MediaDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'photo' | 'video'>('photo');

  return (
    <section className="relative py-12 mb-8">
      <div className="max-w-4xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-light mb-3">
            <span className="text-foreground">See the </span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Transformation
            </span>
          </h2>
        </div>

        {/* Demo Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-lg">
            <div className="flex">
              <button
                onClick={() => setActiveDemo('photo')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                  activeDemo === 'photo'
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Photo Enhancement
              </button>
              <button
                onClick={() => setActiveDemo('video')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                  activeDemo === 'video'
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Video Creation
              </button>
            </div>
          </div>
        </div>

        {/* Main Demo Container */}
        <div className="relative">
          {/* Photo Enhancement Demo */}
          {activeDemo === 'photo' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                {/* Before */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Before</span>
                  </div>
                  <div className="aspect-square bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-4">
                      <div className="w-8 h-8 bg-muted/40 rounded-lg mx-auto mb-2"></div>
                      <p className="text-xs text-muted-foreground">Original Photo</p>
                    </div>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">After</span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl border border-primary/20 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/40 to-orange-500/40 rounded-lg mx-auto mb-2"></div>
                      <p className="text-xs text-foreground font-medium">Enhanced Photo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Creation Demo */}
          {activeDemo === 'video' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="aspect-video bg-muted/20 rounded-2xl border border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5"></div>
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/20 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" onClick={() => setIsPlaying(false)} />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-0.5" onClick={() => setIsPlaying(true)} />
                    )}
                  </div>
                  <p className="text-xs text-white/80">AI-Generated Food Video</p>
                </div>
                
                {/* Video Controls */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/20 rounded-full">
                      <div className="h-full w-1/3 bg-primary rounded-full"></div>
                    </div>
                    <button className="w-6 h-6 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                      <RotateCcw className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};