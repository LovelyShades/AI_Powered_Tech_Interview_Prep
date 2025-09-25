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
          variant="nav"
          size="sm"
          disabled
          className="p-2 sm:px-3"
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="hidden sm:inline sm:ml-2">Loading...</span>
        </Button>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="nav"
              size="sm"
              className="p-2 sm:px-3"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">{user?.email?.split('@')[0] || "Profile"}</span>
              <ChevronDown className="h-3 w-3 ml-1 hidden sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg">
            <DropdownMenuItem onClick={handleSignOut} className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="nav"
          size="sm"
          onClick={handleAuthClick}
          className="p-2 sm:px-3"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-2">Sign In</span>
        </Button>
      )}

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </>
  );
};