import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const MediaDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'photo' | 'video'>('photo');

  return (
    <section className="relative pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            <span className="text-foreground">See the </span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Transformation
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional results in seconds. Watch how AI transforms ordinary food photos 
            into stunning, appetite-inducing visuals.
          </p>
        </div>

        {/* Demo Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-lg">
            <div className="flex">
              <button
                onClick={() => setActiveDemo('photo')}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeDemo === 'photo'
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Photo Enhancement
              </button>
              <button
                onClick={() => setActiveDemo('video')}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
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
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Before/After Images Container */}
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Before */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Before</span>
                      </div>
                      <div className="aspect-square bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder for before image */}
                        <div className="text-center p-6">
                          <div className="w-12 h-12 bg-muted/40 rounded-lg mx-auto mb-3"></div>
                          <p className="text-sm text-muted-foreground">Original Photo</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Smartphone quality</p>
                        </div>
                      </div>
                    </div>

                    {/* After */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">After</span>
                      </div>
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl border border-primary/20 flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder for after image */}
                        <div className="text-center p-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/40 to-orange-500/40 rounded-lg mx-auto mb-3"></div>
                          <p className="text-sm text-foreground font-medium">Enhanced Photo</p>
                          <p className="text-xs text-muted-foreground mt-1">Studio quality</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Enhanced Lighting</h3>
                      <p className="text-muted-foreground">Professional studio lighting automatically applied to make your food look irresistible.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-3"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Color Enhancement</h3>
                      <p className="text-muted-foreground">Rich, vibrant colors that make dishes look fresh and appetizing.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Background Optimization</h3>
                      <p className="text-muted-foreground">Clean, professional backgrounds that don't distract from your food.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-orange-600 text-primary-foreground rounded-xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Try Photo Enhancement
                </Button>
              </div>
            </div>
          )}

          {/* Video Creation Demo */}
          {activeDemo === 'video' && (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Video Player Container */}
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="aspect-video bg-muted/20 rounded-2xl border border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
                    {/* Video Player Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" onClick={() => setIsPlaying(false)} />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" onClick={() => setIsPlaying(true)} />
                        )}
                      </div>
                      <p className="text-sm text-white/80">AI-Generated Food Video</p>
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-white/20 rounded-full">
                          <div className="h-full w-1/3 bg-primary rounded-full"></div>
                        </div>
                        <button className="w-8 h-8 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                          <RotateCcw className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Features */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Dynamic Animations</h3>
                      <p className="text-muted-foreground">Smooth, appetizing animations that bring your food to life.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-3"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Marketing Ready</h3>
                      <p className="text-muted-foreground">Perfect for social media, websites, and advertising campaigns.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
                      <p className="text-muted-foreground">Export in any format optimized for your platform.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-orange-600 text-primary-foreground rounded-xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Create Video Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              90%
            </div>
            <p className="text-muted-foreground">Cost Reduction</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              &lt;30s
            </div>
            <p className="text-muted-foreground">Processing Time</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              100%
            </div>
            <p className="text-muted-foreground">Studio Quality</p>
          </div>
        </div>
      </div>
    </section>
  );
};