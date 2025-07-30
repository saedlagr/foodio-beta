import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
export const MediaDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'photo' | 'video'>('photo');
  
  return (
    <div className="w-full max-w-6xl mx-auto bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Demo preview */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-border/30 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary" />
                  ) : (
                    <Play className="w-8 h-8 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeDemo === 'photo' ? 'Photo Enhancement Preview' : 'Video Creation Preview'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Demo controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsPlaying(false)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeDemo === 'photo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDemo('photo')}
            >
              Photo
            </Button>
            <Button
              variant={activeDemo === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDemo('video')}
            >
              Video
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {activeDemo === 'photo' ? 'AI Photo Enhancement' : 'AI Video Creation'}
            </h3>
            
            <div className="space-y-3">
              {activeDemo === 'photo' ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Smart Enhancement</p>
                      <p className="text-sm text-muted-foreground">Automatically improve lighting, colors, and clarity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Object Removal</p>
                      <p className="text-sm text-muted-foreground">Remove unwanted elements seamlessly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Style Transfer</p>
                      <p className="text-sm text-muted-foreground">Apply artistic styles and filters</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Text to Video</p>
                      <p className="text-sm text-muted-foreground">Generate videos from simple descriptions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Scene Composition</p>
                      <p className="text-sm text-muted-foreground">Create complex scenes with multiple elements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Motion Control</p>
                      <p className="text-sm text-muted-foreground">Direct camera movements and object animations</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};