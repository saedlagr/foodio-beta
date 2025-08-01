import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/hooks/useTokens";
import { Sparkles, User, LogOut } from "lucide-react";

interface PremiumHeaderProps {
  userTokens: number;
}

export const PremiumHeader = ({ userTokens }: PremiumHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50 relative">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold premium-gradient-text">Foodio</h1>
              <p className="text-xs text-gray-400 -mt-1">AI Food Photography</p>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Token Display */}
          <div className="premium-card px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-400">{userTokens} tokens</span>
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant="secondary" className="premium-card px-3 py-1 border border-green-500/30 text-green-400 bg-green-500/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            Ready
          </Badge>
          
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full premium-card border border-white/20 hover:border-white/40 transition-all duration-300">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold">
                      {user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-card border border-white/20" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/10 transition-colors">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}} className="text-red-400 hover:bg-red-500/20 transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="premium-button premium-gradient text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};