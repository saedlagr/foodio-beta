
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Scale, Wifi, Brain, Thermometer, BarChart } from "lucide-react";

export const Technology = () => {
  const techFeatures = [
    {
      icon: Eye,
      title: "AI Vision",
      description: "Advanced computer vision ensures accurate product recognition and loss prevention"
    },
    {
      icon: Scale,
      title: "Weight Sensors",
      description: "Precise weight detection validates purchases and monitors inventory levels"
    },
    {
      icon: Thermometer,
      title: "Dual-Climate Zones",
      description: "Fresh salads and frozen treats in a single intelligent cabinet"
    },
    {
      icon: Wifi,
      title: "IoT Monitoring",
      description: "Real-time reporting of stock levels, temperature, and system health"
    },
    {
      icon: Brain,
      title: "Predictive AI",
      description: "Machine learning optimizes restocking schedules and product placement"
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Comprehensive insights drive data-informed business decisions"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Cutting-Edge Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our smart vending solutions leverage the latest in IoT, AI, and cloud computing 
            to deliver unparalleled performance and reliability.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {techFeatures.map((feature, index) => (
            <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <feature.icon className="w-16 h-16 text-[#00CFCF] mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Technology Demo Section */}
        <div className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-[#00CFCF]">
                Smart Cabinet Architecture
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#7ED321] rounded-full mr-4"></div>
                  <span>Cloud-connected inventory management</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#7ED321] rounded-full mr-4"></div>
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#7ED321] rounded-full mr-4"></div>
                  <span>Real-time health monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#7ED321] rounded-full mr-4"></div>
                  <span>Predictive maintenance alerts</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#00CFCF]/20 to-[#7ED321]/20 rounded-xl p-8 border border-[#00CFCF]/30">
              <div className="text-center">
                <div className="w-32 h-48 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-[#00CFCF]/50">
                  <div className="text-6xl text-[#00CFCF]">📱</div>
                </div>
                <p className="text-lg font-semibold">Interactive Touchscreen</p>
                <p className="text-gray-300 text-sm mt-2">Intuitive interface for seamless shopping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
