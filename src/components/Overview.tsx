
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Shield } from "lucide-react";

export const Overview = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "Curated Inventory",
      description: "AI-powered product selection tuned to each site's demographics and usage patterns"
    },
    {
      icon: Shield,
      title: "Frictionless Checkout",
      description: "Cashless payments via cards, mobile wallets, and ID badges"
    },
    {
      icon: TrendingUp,
      title: "Remote Analytics",
      description: "Cloud-based monitoring with automated restocking and maintenance alerts"
    },
    {
      icon: Users,
      title: "Flexible Footprints",
      description: "From single-machine kiosks to multi-compartment micro-markets"
    }
  ];

  return (
    <section className="py-20 bg-[#F4F4F4]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            Intelligent Retail, Delivered
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Futureats combines intelligent vending hardware with cloud-based analytics to deliver 
            tailored, 24/7 self-service retail experiences across diverse environments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <feature.icon className="w-16 h-16 text-[#00CFCF] mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#00CFCF] mb-2">$3B+</div>
              <div className="text-lg text-gray-600">Food & Beverage Vending Sales (2023)</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#7ED321] mb-2">21%</div>
              <div className="text-lg text-gray-600">Year-over-Year Growth</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00CFCF] mb-2">24/7</div>
              <div className="text-lg text-gray-600">Autonomous Operation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
