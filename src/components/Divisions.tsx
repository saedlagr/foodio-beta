
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Home, Dumbbell, Leaf } from "lucide-react";

export const Divisions = () => {
  const divisions = [
    {
      name: "CIVIQ Market™",
      tagline: "Fueling Focus, 24/7.",
      audience: "Corporate offices, co-working spaces, business parks",
      primaryColor: "#007AFF",
      secondaryColor: "#6E6E6E",
      icon: Building2,
      focus: "Healthy, energizing snacks and quick meals to boost productivity",
      products: ["Fresh sandwiches & salads", "Protein bars (RXBar, KIND)", "Cold brew & energy drinks", "Wellness shots & kombucha"]
    },
    {
      name: "NOOK Essentials™",
      tagline: "Everything you forgot, right downstairs.",
      audience: "Apartments, condos, hotels",
      primaryColor: "#FF9500",
      secondaryColor: "#F2D398",
      icon: Home,
      focus: "A mini convenience store mix of snacks, beverages, and everyday essentials",
      products: ["Travel-size toiletries", "Laundry supplies", "Quick meals & snacks", "Emergency essentials"]
    },
    {
      name: "PWRFuel™",
      tagline: "Grab. Go. Grow Strong.",
      audience: "Gyms, yoga studios, athletic facilities",
      primaryColor: "#FF3B30",
      secondaryColor: "#333333",
      icon: Dumbbell,
      focus: "Performance nutrition, hydration, recovery aids, and workout essentials",
      products: ["Protein shakes & bars", "Electrolyte drinks", "Recovery supplements", "Workout accessories"]
    },
    {
      name: "FIELD & FORK™",
      tagline: "Curated. Local. Delicious.",
      audience: "High-end apartments, creative spaces, universities",
      primaryColor: "#2ECC71",
      secondaryColor: "#8B5E3C",
      icon: Leaf,
      focus: "Local, organic, and sustainable items celebrating New Jersey's artisan producers",
      products: ["Locally made granola", "Organic teas & juices", "Vegan & gluten-free options", "Sustainable packaging"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
            Four Tailored Experiences
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Each division carries the core Futureats platform but differs in branding, 
            product mix, and target audience to perfectly serve specific markets.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {divisions.map((division, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="h-32 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: division.primaryColor }}
                >
                  <division.icon className="w-16 h-16 text-white opacity-20 absolute top-4 right-4" />
                  <div className="text-center text-white z-10">
                    <h3 className="text-2xl font-bold mb-2">{division.name}</h3>
                    <p className="text-lg opacity-90">"{division.tagline}"</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
                </div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#1A1A1A] mb-2">Target Audience</h4>
                    <p className="text-gray-600">{division.audience}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#1A1A1A] mb-2">Focus</h4>
                    <p className="text-gray-600">{division.focus}</p>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-[#1A1A1A] mb-3">Key Products</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {division.products.map((product, productIndex) => (
                        <div key={productIndex} className="text-sm text-gray-600 flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: division.primaryColor }}
                          ></div>
                          {product}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full font-semibold hover:text-white transition-all duration-300"
                    style={{ 
                      borderColor: division.primaryColor, 
                      color: division.primaryColor 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = division.primaryColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Learn More About {division.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
