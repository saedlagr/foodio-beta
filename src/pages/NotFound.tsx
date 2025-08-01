import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-4">
          <img src="/lovable-uploads/592c6a0e-acaf-4769-a4e1-d4b0a60ad014.png" alt="Foodio" className="h-8 w-auto" />
        </div>
        <a href="/" className="text-primary hover:text-primary/80 underline font-medium">
          Back to Home
        </a>
      </header>
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-300 mb-4">Oops! Page not found</p>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
