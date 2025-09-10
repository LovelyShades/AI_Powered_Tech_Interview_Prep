import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, LogIn, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AuthDialog } from "./AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AuthButton = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isAuthenticated, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error("Failed to sign out: " + error.message);
      } else {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
    }
  };

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="text-white hover:bg-white/10"
      >
        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <User className="h-4 w-4 mr-2" />
              {user?.email?.split('@')[0] || "Profile"}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAuthClick}
          className="text-white hover:bg-white/10"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      )}

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </>
  );
};