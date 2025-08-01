import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Shield, Clock, Image as ImageIcon, Palette, Star } from "lucide-react";

export const PremiumSettingsSidebar = () => {
  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI-Powered Enhancement",
      description: "Advanced AI algorithms for professional food photography",
      color: "text-yellow-400"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Processing",
      description: "Your images are processed securely and privately",
      color: "text-green-400"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Fast Processing",
      description: "Get results in 3-4 minutes with live progress tracking",
      color: "text-blue-400"
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      title: "Multiple Formats",
      description: "Support for PNG, JPG, JPEG, and WebP formats",
      color: "text-purple-400"
    }
  ];

  const supportedFormats = ['PNG', 'JPG', 'JPEG', 'WebP'];

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Settings</h3>
              <p className="text-sm text-gray-400">Configure your preferences</p>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-white">Supported Formats</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {supportedFormats.map((format) => (
                <div key={format} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300 font-medium">{format}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Premium Features</h3>
              <p className="text-sm text-gray-400">What makes us special</p>
            </div>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className={`flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it Works Card */}
      <Card className="premium-card">
        <CardContent className="p-6">
          <h3 className="font-semibold text-white text-lg mb-6">How it works</h3>
          <div className="space-y-4">
            {[
              { step: 1, title: "Upload", description: "Select one or more food images" },
              { step: 2, title: "Transform", description: "Click to process with AI enhancement" },
              { step: 3, title: "Download", description: "Get your professional food photos" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">System Status</h3>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Online
            </Badge>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Processing Queue</span>
              <span className="text-green-400">Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Models</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time</span>
              <span className="text-blue-400">&lt; 1s</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};