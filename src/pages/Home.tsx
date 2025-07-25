import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, Workflow, Bot, Plus, Paperclip, Upload } from "lucide-react";

export const Home = () => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle workflow generation
    console.log("Generating workflow for:", prompt);
  };

  const quickStarters = [
    "Sync Shopify orders to Google Sheets",
    "Send Slack notifications for new leads", 
    "Create a customer onboarding flow",
    "Build an email drip campaign",
    "Automate invoice processing",
    "Set up social media posting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden relative">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-64 h-64 bg-emerald-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-600 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Matrix grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="matrix-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(16 185 129)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matrix-grid)" />
        </svg>
      </div>

      {/* Floating code elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 text-emerald-500/20 font-mono text-sm animate-float">
          {"{ trigger: 'webhook' }"}
        </div>
        <div className="absolute top-40 right-1/3 text-emerald-400/20 font-mono text-sm animate-float delay-1000">
          {"POST /api/workflows"}
        </div>
        <div className="absolute bottom-40 left-1/6 text-emerald-600/20 font-mono text-sm animate-float delay-2000">
          {"n8n.workflow.execute()"}
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/8c03dabd-dd83-453a-9034-8a2363b6e7de.png" 
              alt="Floest" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Floest
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Community</a>
            <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Enterprise</a>
            <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Resources</a>
            <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black">
              Sign In
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-6 py-20 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            Build something
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Automated
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed">
            Create powerful n8n workflows by chatting with AI.
            <br />
            No nodes, no complexity—just describe what you want to automate.
          </p>

          {/* Main Input */}
          <div className="w-full max-w-4xl mb-8">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex-1">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask Floest to create a workflow for your automation..."
                      className="bg-transparent border-none text-lg placeholder:text-gray-500 focus:outline-none focus:ring-0 px-0"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                    >
                      <Upload className="h-5 w-5" />
                    </Button>
                    <Button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Workflow className="h-4 w-4" />
                      <span>n8n Workflows</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Bot className="h-4 w-4" />
                      <span>AI Powered</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Zap className="h-4 w-4" />
                      <span>Instant Deploy</span>
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Starters */}
          <div className="w-full max-w-4xl">
            <p className="text-gray-400 mb-4">or try one of these popular automations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(starter)}
                  className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl text-left text-sm text-gray-300 hover:text-white transition-all duration-200 hover:border-emerald-500/50"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl">
            <div className="text-center p-6 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/30">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Driven Design</h3>
              <p className="text-gray-400">Chat with AI to design complex workflows without touching a single node</p>
            </div>
            
            <div className="text-center p-6 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/30">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Workflow className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">n8n Native</h3>
              <p className="text-gray-400">Deploy directly to your n8n instance with full compatibility and monitoring</p>
            </div>
            
            <div className="text-center p-6 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/30">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Deploy</h3>
              <p className="text-gray-400">From conversation to live automation in minutes, not hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};