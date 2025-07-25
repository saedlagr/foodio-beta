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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <img 
            src="/lovable-uploads/8c03dabd-dd83-453a-9034-8a2363b6e7de.png" 
            alt="Floest" 
            className="h-8 w-auto"
          />
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Community</a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Enterprise</a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Pricing</a>
            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black text-sm">
              Sign In
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
          <h1 className="text-6xl md:text-8xl font-light mb-8 text-white">
            Build something
            <br />
            <span className="text-green-400">
              Automated
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-16 max-w-lg">
            Automate your workflows.
          </p>

          {/* Main Input */}
          <div className="w-full max-w-2xl mb-12">
            <form onSubmit={handleSubmit}>
              <div className="relative bg-white/5 border border-gray-800 rounded-2xl p-1">
                <div className="flex items-center">
                  <div className="flex-1 px-4">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask Floest to create a workflow..."
                      className="bg-transparent border-none text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 px-0 text-lg h-14"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="bg-green-400 hover:bg-green-500 text-black rounded-xl px-6 h-12 mr-1"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Starters */}
          <div className="w-full max-w-3xl">
            <p className="text-gray-500 mb-6 text-sm">Try one of these</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(starter)}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-xl text-left text-sm text-gray-300 hover:text-white transition-all duration-200"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};