
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Repeat, Users, ArrowRight } from "lucide-react";

export const BusinessModel = () => {
  const models = [
    {
      icon: DollarSign,
      title: "Machine Rental + Revenue Share",
      description: "Low or zero upfront cost for sites with Futureats earning a percentage of sales",
      benefits: ["Minimal initial investment", "Shared risk model", "Performance-based returns"]
    },
    {
      icon: Repeat,
      title: "Vending-as-a-Service",
      description: "Subscription or leasing model with optional client stocking arrangements",
      benefits: ["Predictable monthly costs", "Full service support", "Flexible stocking options"]
    },
    {
      icon: Users,
      title: "Platform Partnerships",
      description: "White-label SaaS and hardware packages for third-party operators",
      benefits: ["Scalable business model", "Technology licensing", "Partner network growth"]
    }
  ];

  return (
    <section className="py-20 bg-[#F4F4F4]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            Flexible Business Models
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the deployment model that best fits your business needs and growth objectives.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {models.map((model, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <model.icon className="w-16 h-16 text-[#00CFCF] mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">{model.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{model.description}</p>
                <ul className="space-y-2">
                  {model.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-[#7ED321] rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the growing number of businesses leveraging smart vending technology 
            to enhance customer experience and generate new revenue streams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#00CFCF] hover:bg-[#00B8B8] text-[#1A1A1A] font-semibold px-8 py-4">
              Schedule Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-[#00CFCF] text-[#00CFCF] hover:bg-[#00CFCF] hover:text-[#1A1A1A] px-8 py-4">
              Download Brochure
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
