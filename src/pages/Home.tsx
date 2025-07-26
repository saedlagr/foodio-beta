import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Workflow, Bot } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
export const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const navigate = useNavigate();
  
  // Animated title cycling
  const titles = [
    { text: "Build something", highlight: "Automated", text2: "" },
    { text: "The", highlight: "Vibe Coder's", text2: "Best Friend" },
    { text: "The", highlight: "Automator's", text2: "Automator" },
    { text: "", highlight: "Agents & Workflows", text2: "Made Easy" },
    { text: "Your", highlight: "AI Development", text2: "Partner" },
    { text: "Code", highlight: "Smarter", text2: ", Not Harder" },
    { text: "", highlight: "Backend Magic", text2: "Made Simple" },
    { text: "From", highlight: "Frontend to APIs", text2: "Instantly" },
    { text: "", highlight: "No-Code", text2: "Meets Pro-Code" }
  ];
  
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        setIsAnimating(false);
      }, 500);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [titles.length]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Navigate to chat interface with the prompt and mode
      navigate('/chat', { 
        state: { 
          initialPrompt: prompt.trim(),
          mode: isAgent ? 'agent' : 'workflow'
        }
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-400/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center p-8 backdrop-blur-sm">
          <img src="/lovable-uploads/8c03dabd-dd83-453a-9034-8a2363b6e7de.png" alt="Floest" className="h-10 w-auto brightness-0 dark:brightness-100 dark:hue-rotate-90 dark:saturate-150 transition-all duration-300" />
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Community</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Enterprise</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pricing</a>
            <ThemeToggle />
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground backdrop-blur-sm">
              Sign In
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-light mb-6 text-foreground leading-tight min-h-[1.5em] flex flex-col items-center justify-center">
              <span
                className={`transition-all duration-500 ease-in-out ${
                  isAnimating 
                    ? 'opacity-0 transform -translate-y-4 scale-95' 
                    : 'opacity-100 transform translate-y-0 scale-100'
                }`}
              >
                <span className="text-foreground">{titles[currentTitleIndex].text} </span>
                <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  {titles[currentTitleIndex].highlight}
                </span>
                <span className="text-foreground"> {titles[currentTitleIndex].text2}</span>
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create powerful workflows and AI agents that automate your business processes.
            </p>
          </div>

          {/* Main Input Section */}
          <div className="w-full max-w-3xl mb-16">
            {/* Mode Toggle - Dual-sided Interface */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                <div className="flex">
                  <button
                    onClick={() => setIsAgent(false)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 relative ${
                      !isAgent 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-primary-foreground shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/5'
                    }`}
                  >
                    <Workflow className="w-5 h-5" />
                    <span className="font-semibold text-lg">Workflow</span>
                  </button>
                  <button
                    onClick={() => setIsAgent(true)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 relative ${
                      isAgent 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-primary-foreground shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/5'
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold text-lg">AI Agent</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Input Container */}
            <form onSubmit={handleSubmit} className="mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 px-6">
                      <Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={isAgent ? "Describe the AI agent you want to create..." : "Describe the workflow you want to automate..."} className="bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-lg h-16 font-medium" />
                    </div>
                    
                    <Button type="submit" disabled={!prompt.trim()} className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-primary-foreground rounded-xl px-8 h-14 font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};