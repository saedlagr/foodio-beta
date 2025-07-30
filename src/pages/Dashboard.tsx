import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Camera, Download, Share2, MoreHorizontal, Clock, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock data for past generations
const mockGenerations = [
  {
    id: 1,
    originalImage: "/lovable-uploads/500b571c-e7f4-4f75-9e3f-818ba13519a9.png",
    enhancedImage: "/lovable-uploads/75646a35-0334-4073-96a5-61c18f77a77d.png",
    title: "Gourmet Burger",
    createdAt: "2024-01-15",
    status: "completed",
    downloadCount: 12
  },
  {
    id: 2,
    originalImage: "/lovable-uploads/9e551e8d-7e1d-4317-99d6-72038809c886.png",
    enhancedImage: "/lovable-uploads/ad5239ca-2238-4f89-b1e6-5ae360b1b766.png",
    title: "Fresh Ramen Bowl",
    createdAt: "2024-01-14",
    status: "completed",
    downloadCount: 8
  },
  {
    id: 3,
    originalImage: "/lovable-uploads/d25a559b-3657-47a0-b003-8bf3f96a6070.png",
    enhancedImage: "/lovable-uploads/9ec6652e-eb8d-4eb6-8495-c1b80c3197e8.png",
    title: "Loaded Fries",
    createdAt: "2024-01-13",
    status: "processing",
    downloadCount: 0
  }
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [generations] = useState(mockGenerations);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/lovable-uploads/fae6ccf8-cbb0-42c9-bb05-8b5112d87509.png" alt="Foodio" className="h-8 w-auto dark:hidden" />
              <img src="/lovable-uploads/19a613a5-687b-443f-9a7e-df9d77fbddf2.png" alt="Foodio" className="h-8 w-auto hidden dark:block" />
              <Separator orientation="vertical" className="h-8" />
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/dashboard" className="text-foreground font-medium">Dashboard</Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm">Account</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
              <p className="text-muted-foreground text-lg">Transform your food photos with AI-powered enhancement</p>
            </div>
            
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/chat')}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Generation
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <p className="text-sm text-muted-foreground">Photos Enhanced</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">156</p>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Share2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">89</p>
                    <p className="text-sm text-muted-foreground">Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Generations */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Generations</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((generation) => (
              <Card key={generation.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative">
                  <div className="grid grid-cols-2 h-full">
                    {/* Before */}
                    <div className="bg-muted/30 p-3 flex flex-col">
                      <div className="text-xs font-medium text-muted-foreground mb-2">BEFORE</div>
                      <div className="flex-1 bg-background rounded-lg overflow-hidden">
                        <img 
                          src={generation.originalImage} 
                          alt="Original" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* After */}
                    <div className="bg-primary/5 p-3 flex flex-col">
                      <div className="text-xs font-medium text-primary mb-2">AFTER</div>
                      <div className="flex-1 bg-primary/10 rounded-lg overflow-hidden">
                        <img 
                          src={generation.enhancedImage} 
                          alt="Enhanced" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant={generation.status === 'completed' ? 'default' : 'secondary'}>
                      {generation.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {generation.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{generation.title}</h3>
                      <p className="text-sm text-muted-foreground">{generation.createdAt}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {generation.downloadCount} downloads
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State (if no generations) */}
        {generations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No generations yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by uploading your first food photo to see the magic of AI enhancement
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/chat')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Generation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};