import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Camera, Upload, Star, Heart, Eye, Settings, LogOut, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useAuth } from "@/hooks/useAuth";
import { useTokens } from "@/hooks/useTokens";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getUserTokens } = useTokens();
  const [profile, setProfile] = useState<any>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTokens();
      fetchImages();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setProfile(data);
  };

  const fetchTokens = async () => {
    if (!user) return;
    
    const tokenCount = await getUserTokens(user.id);
    setTokens(tokenCount);
  };

  const fetchImages = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setImages(data || []);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const photoCount = images.length;

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/fae6ccf8-cbb0-42c9-bb05-8b5112d87509.png" alt="Foodio" className="h-8 w-auto dark:hidden" />
            <img src="/lovable-uploads/19a613a5-687b-443f-9a7e-df9d77fbddf2.png" alt="Foodio" className="h-8 w-auto hidden dark:block" />
            <Separator orientation="vertical" className="h-8" />
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/dashboard" className="text-foreground font-medium">Portfolio</Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
                <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem disabled>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Profile Hero Section */}
        <div className="relative mb-16">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl"></div>
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Profile Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-2 -right-2 bg-primary">
                  PRO
                </Badge>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                      {profile?.full_name || "Food Creator"}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-2">
                      {profile?.business_name || "Food Photographer & Content Creator"}
                    </p>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Creating delicious content</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{photoCount}</p>
                <p className="text-sm text-muted-foreground">Photos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{tokens}</p>
                <p className="text-sm text-muted-foreground">Tokens</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-border/50">
          <button className="pb-4 border-b-2 border-primary text-primary font-medium">
            Work <sup className="text-xs">{photoCount}</sup>
          </button>
          <button className="pb-4 text-muted-foreground hover:text-foreground transition-colors">
            Collections
          </button>
          <button className="pb-4 text-muted-foreground hover:text-foreground transition-colors">
            Liked
          </button>
          <button className="pb-4 text-muted-foreground hover:text-foreground transition-colors">
            About
          </button>
        </div>

        {/* Portfolio Grid */}
        {photoCount === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <Camera className="h-16 w-16 text-primary/60" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Start Your Food Photography Journey</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Upload your first food photo and watch AI transform it into something spectacular.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Your First Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="group overflow-hidden hover-scale cursor-pointer">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={image.file_path} 
                    alt={image.description || "Food image"} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground truncate">
                        {image.description || image.filename}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          0
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          0
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};