import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export const Generator = () => {
  const [prompt, setPrompt] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [styleIntensity, setStyleIntensity] = useState([0.7]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter your n8n webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          prompt: prompt.trim(),
          style_intensity: styleIntensity[0],
          timestamp: new Date().toISOString(),
          user_id: "test-user", // You can replace this with actual user ID
        }),
      });

      toast({
        title: "Generation Started",
        description: "Your request has been sent to n8n. Check your webhook for processing status.",
      });

      // For demo purposes, add a placeholder image
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: "/placeholder.svg", // This would be replaced by actual generated image URL
        prompt: prompt.trim(),
        timestamp: new Date(),
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt("");

    } catch (error) {
      console.error("Error calling webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger generation. Please check your webhook URL.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">AI Generator</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Ready
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generation Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook">n8n Webhook URL</Label>
                    <Input
                      id="webhook"
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prompt">Describe what you want to create</Label>
                    <Textarea
                      id="prompt"
                      placeholder="A vibrant character wearing a colorful dress that sways with her every movement..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-2 min-h-[100px] resize-none"
                    />
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="w-full h-12 text-lg font-medium"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate
                        <Zap className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Images Grid */}
            {generatedImages.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {image.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {image.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4" />
                  <h3 className="font-semibold">Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Style Intensity</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={styleIntensity}
                        onValueChange={setStyleIntensity}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtle</span>
                        <span>{styleIntensity[0].toFixed(1)}</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Quick Prompts</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        "Anime character in vibrant colors",
                        "Fantasy landscape with magic",
                        "Cyberpunk city at night",
                        "Cute animal illustration"
                      ].map((quickPrompt) => (
                        <Button
                          key={quickPrompt}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          onClick={() => setPrompt(quickPrompt)}
                        >
                          <span className="text-xs">{quickPrompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">How it works</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p>Enter your n8n webhook URL</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p>Describe your image idea</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p>Click generate to trigger your n8n workflow</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};