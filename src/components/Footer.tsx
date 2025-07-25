
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Home, Dumbbell, Leaf, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const divisions = [
    { name: "CIVIQ Market™", icon: Building2, color: "#007AFF" },
    { name: "NOOK Essentials™", icon: Home, color: "#FF9500" },
    { name: "PWRFuel™", icon: Dumbbell, color: "#FF3B30" },
    { name: "FIELD & FORK™", icon: Leaf, color: "#2ECC71" }
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00CFCF] to-[#7ED321] bg-clip-text text-transparent">
              FUTUREATS
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Revolutionizing unattended retail with intelligent vending solutions 
              across New Jersey and beyond.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-3 text-[#00CFCF]" />
                <span className="text-sm">contact@futureats.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-3 text-[#00CFCF]" />
                <span className="text-sm">(555) 123-EATS</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-3 text-[#00CFCF]" />
                <span className="text-sm">New Jersey, USA</span>
              </div>
            </div>
          </div>
          
          {/* Divisions */}
          <div className="lg:col-span-2">
            <h4 className="text-xl font-semibold mb-6">Our Divisions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {divisions.map((division, index) => (
                <div key={index} className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
                  <division.icon 
                    className="w-8 h-8 mr-3" 
                    style={{ color: division.color }}
                  />
                  <span className="font-medium">{division.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-xl font-semibold mb-6">Stay Updated</h4>
            <p className="text-gray-400 mb-4 text-sm">
              Get the latest news on smart vending technology and industry insights.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-[#00CFCF] hover:bg-[#00B8B8] text-[#1A1A1A] font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Futureats. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-[#00CFCF] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#00CFCF] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#00CFCF] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
