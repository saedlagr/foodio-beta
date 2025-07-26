
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Paperclip } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if we have an initial prompt from navigation state
    const state = location.state as { initialPrompt?: string; mode?: string } | null;
    if (state?.initialPrompt) {
      // Auto-send the initial prompt
      const initialMessage: Message = {
        id: Date.now().toString(),
        content: state.initialPrompt,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      
      // Send to backend immediately
      setIsLoading(true);
      fetch('https://sgxlabs.app.n8n.cloud/webhook/bac2d4c8-7e50-42c4-9d80-b08c09fd6f50', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: state.initialPrompt,
          mode: state.mode,
          timestamp: new Date().toISOString(),
        }),
      })
      .then(response => response.text())
      .then(data => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data || "I'll help you build that!",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      })
      .catch(error => {
        console.error('Error sending initial message:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm ready to help you build! What would you like to create?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [location.state]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('https://sgxlabs.app.n8n.cloud/webhook/bac2d4c8-7e50-42c4-9d80-b08c09fd6f50', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.text();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data || "I received your message!",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Uploaded: ${file.name}`,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fileMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-400/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-6 backdrop-blur-sm border-b border-border">
          <img src="/lovable-uploads/8c03dabd-dd83-453a-9034-8a2363b6e7de.png" alt="Floest" className="h-8 w-auto filter invert brightness-0 saturate-100 dark:invert-0 dark:brightness-100 dark:saturate-100 dark:hue-rotate-90 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-20">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-lg">Ready to build something amazing?</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">Send a message to get started</p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[80%] ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-primary-foreground' 
                    : 'bg-card/50 backdrop-blur-xl border border-border text-foreground'
                } rounded-2xl p-4 shadow-xl`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className={`text-xs mt-2 block ${
                    message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl">
                  <div className="flex space-x-2 items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-muted-foreground text-sm ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Section */}
          <div className="p-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground hover:text-primary hover:bg-accent rounded-xl"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base h-12 font-medium"
                  />
                  
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputValue.trim()}
                    className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-primary-foreground rounded-xl px-6 h-12 font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
