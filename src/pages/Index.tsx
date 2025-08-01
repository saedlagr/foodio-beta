
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Paperclip } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";


interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();
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
      fetch('https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            message: state.initialPrompt
          }
        }),
      })
      .then(async response => {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('image/')) {
          // Handle binary image response
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          // Upload the processed image to our vector store as "after" image
          try {
            const imageFile = new File([imageBlob], `processed-${Date.now()}.png`, { type: 'image/png' });
            const uploadResult = await uploadImage(imageFile, 'AI processed image', 'after');
            
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: uploadResult.success ? "Here's your enhanced image!" : "Image processed successfully!",
              isUser: false,
              timestamp: new Date(),
              image: imageUrl,
            };
            setMessages(prev => [...prev, botMessage]);
          } catch (uploadError) {
            console.error('Error uploading processed image:', uploadError);
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "Here's your enhanced image!",
              isUser: false,
              timestamp: new Date(),
              image: imageUrl,
            };
            setMessages(prev => [...prev, botMessage]);
          }
        } else {
          // Handle text/JSON response
          const responseText = await response.text();
          console.log('Initial response:', responseText);
          let data;
          try {
            data = responseText ? JSON.parse(responseText) : {};
          } catch (e) {
            data = { message: responseText };
          }
          
          const messageContent = data.message || data.output || data.result || data.response || (responseText && responseText.trim() !== '' ? responseText : "Hello! I'm ready to help you with your food photos.");
          
          // Check if the message contains an image URL from tempfile.aiquickdraw.com
          const imageUrlMatch = messageContent.match(/https:\/\/tempfile\.aiquickdraw\.com[^\s]*/);
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: imageUrlMatch ? "Here's your enhanced image!" : messageContent,
            isUser: false,
            timestamp: new Date(),
            image: imageUrlMatch ? imageUrlMatch[0] : undefined,
          };
          setMessages(prev => [...prev, botMessage]);
        }
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
      console.log('Sending message to webhook:', currentInput);
      console.log('Webhook URL:', 'https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7');
      
      const response = await fetch('https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            message: currentInput
          }
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        // Try to handle as binary image first, regardless of content-type
        // because n8n might not set the correct content-type header
        try {
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          
          // Check if it's a huge binary string (likely image data)
          if (responseText.length > 10000 && !responseText.startsWith('{') && !responseText.startsWith('[')) {
            console.log('Detected large binary response, treating as image');
            
            // Convert the response to blob and create image
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            
            // Upload the processed image to our vector store as "after" image
            try {
              const imageFile = new File([imageBlob], `processed-${Date.now()}.png`, { type: 'image/png' });
              const uploadResult = await uploadImage(imageFile, 'AI processed image', 'after');
              
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: uploadResult.success ? "Here's your enhanced image!" : "Image processed successfully!",
                isUser: false,
                timestamp: new Date(),
                image: imageUrl,
              };
              setMessages(prev => [...prev, botMessage]);
            } catch (uploadError) {
              console.error('Error uploading processed image:', uploadError);
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Here's your enhanced image!",
                isUser: false,
                timestamp: new Date(),
                image: imageUrl,
              };
              setMessages(prev => [...prev, botMessage]);
            }
            return;
          }
        } catch (e) {
          console.log('Error checking for binary data:', e);
        }

        if (contentType && contentType.includes('image/')) {
          // Handle direct binary image response with proper content-type
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          // Upload the processed image to our vector store as "after" image
          try {
            const imageFile = new File([imageBlob], `processed-${Date.now()}.png`, { type: 'image/png' });
            const uploadResult = await uploadImage(imageFile, 'AI processed image', 'after');
            
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: uploadResult.success ? "Here's your enhanced image!" : "Image processed successfully!",
              isUser: false,
              timestamp: new Date(),
              image: imageUrl,
            };
            setMessages(prev => [...prev, botMessage]);
          } catch (uploadError) {
            console.error('Error uploading processed image:', uploadError);
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "Here's your enhanced image!",
              isUser: false,
              timestamp: new Date(),
              image: imageUrl,
            };
            setMessages(prev => [...prev, botMessage]);
          }
        } else {
          // Handle text/JSON response
          const responseText = await response.text();
          console.log('Raw response length:', responseText.length);
          
          // Check if this is a Cloudflare error page
          if (responseText.includes('<!DOCTYPE html>') && responseText.includes('timeout occurred')) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "The image processing service is currently experiencing high load. Please try again in a few moments. 🔄",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            return;
          }
          
          let data;
          try {
            data = responseText ? JSON.parse(responseText) : {};
          } catch (e) {
            console.log('Response is not JSON, using as plain text');
            data = { message: responseText };
          }
          
          const messageContent = data.message || data.output || data.result || responseText || "I received your message!";
          
          // Check if the message contains an image URL from tempfile.aiquickdraw.com
          const imageUrlMatch = messageContent.match(/https:\/\/tempfile\.aiquickdraw\.com[^\s]*/);
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: imageUrlMatch ? "Here's your enhanced image!" : messageContent,
            isUser: false,
            timestamp: new Date(),
            image: imageUrlMatch ? imageUrlMatch[0] : undefined,
          };
          setMessages(prev => [...prev, botMessage]);
        }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: file.name,
        isUser: true,
        timestamp: new Date(),
        image: imageUrl,
      };
      setMessages(prev => [...prev, fileMessage]);

      try {
        // Auto-detect image type based on filename or use 'before' as default
        const imageType = file.name.toLowerCase().includes('after') || 
                         file.name.toLowerCase().includes('enhanced') || 
                         file.name.toLowerCase().includes('processed') ? 'after' : 'before';
        
        // Start processing state
        setIsProcessing(true);
        
        // Upload using the hook with auto-detected image type
        const result = await uploadImage(file, `Process this ${imageType} food image: ${file.name}`, imageType);
        
        if (result.success && result.db_record_id) {
          // Wait for the n8n webhook response
          try {
            const webhookResponse = await fetch('https://sgxlabs.app.n8n.cloud/webhook/63fa615f-c551-4ab4-84d3-67cf6ea627d7', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                body: {
                  jobId: result.db_record_id,
                  imageUrl: result.image_url,
                  message: `Process this ${imageType} food image: ${file.name}`
                }
              }),
            });

            if (webhookResponse.ok) {
              const responseData = await webhookResponse.json();
              
              // Show the enhanced image result
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: responseData.message || "Here's your enhanced image!",
                isUser: false,
                timestamp: new Date(),
                image: responseData.enhancedImageUrl || responseData.image_url,
              };
              setMessages(prev => [...prev, botMessage]);
            } else {
              throw new Error(`Webhook error! status: ${webhookResponse.status}`);
            }
          } catch (webhookError) {
            console.error('Error calling webhook:', webhookError);
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "Sorry, image processing failed. Please try again.",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
          }
          setIsProcessing(false);
          
        } else {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: result.error || "Sorry, I had trouble processing your image. Please try again.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I had trouble processing your image. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsProcessing(false);
      }
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-6 backdrop-blur-sm border-b border-border">
          <img src="/lovable-uploads/fae6ccf8-cbb0-42c9-bb05-8b5112d87509.png" alt="Foodio" className="h-8 w-auto dark:hidden" />
          <img src="/lovable-uploads/19a613a5-687b-443f-9a7e-df9d77fbddf2.png" alt="Foodio" className="h-8 w-auto hidden dark:block" />
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Foodio AI
            </h1>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-20">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg">Ready to enhance your food photos?</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">Upload a photo or describe what you need</p>
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
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground' 
                    : 'bg-card/50 backdrop-blur-xl border border-border text-foreground'
                } rounded-2xl p-4 shadow-xl`}>
                  {message.image && (
                    <div className="mb-3">
                      <img 
                        src={message.image} 
                        alt="Uploaded image" 
                        className="max-w-full h-auto rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className={`text-xs mt-2 block ${
                    message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {(isLoading || isUploading || isProcessing) && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl">
                  <div className="flex space-x-2 items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-muted-foreground text-sm ml-2">
                      {isUploading ? 'Processing image...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
          
          {/* Input Section */}
          <div className="p-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
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
                    placeholder="Describe your food photo enhancement needs..."
                    className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base h-12 font-medium"
                  />
                  
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputValue.trim() || isUploading}
                    className="bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-orange-600 text-primary-foreground rounded-xl px-6 h-12 font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
