import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Sun, Moon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthModalType } from "@/components/auth/AuthModals";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Props to accept the auth modal controls from parent
interface NavbarProps {
  onOpenAuthModal?: (type: AuthModalType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // For backward compatibility if not provided
  const openAuthModal = (type: AuthModalType) => {
    if (onOpenAuthModal) {
      onOpenAuthModal(type);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/venues?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">RentMyVenue</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/venues"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Browse Venues
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            to="/become-a-host"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Become a Host
          </Link>
        </nav>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center w-full max-w-sm mx-6"
        >
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search venues..."
              className="w-full rounded-full bg-secondary pl-8 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatarUrl}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate(`/${user?.role}/dashboard`)}
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/${user?.role}/bookings`)}
                >
                  Bookings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/${user?.role}/profile`)}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/${user?.role}/settings`)}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => openAuthModal("login")}>
                Sign In
              </Button>
              <Button onClick={() => openAuthModal("signup")}>Register</Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "flex flex-col md:hidden",
          isMenuOpen ? "block" : "hidden",
        )}
      >
        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="p-4 border-b">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search venues..."
              className="w-full rounded-full bg-secondary pl-8 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile Navigation Links */}
        <nav className="flex flex-col p-4 space-y-4">
          <Link
            to="/venues"
            className="flex items-center text-sm font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Browse Venues
          </Link>
          <Link
            to="/how-it-works"
            className="flex items-center text-sm font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            to="/become-a-host"
            className="flex items-center text-sm font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Become a Host
          </Link>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center justify-start w-full px-2 py-2"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark mode</span>
                </>
              )}
            </Button>
          </div>

          {/* Mobile Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex flex-col space-y-2 border-t pt-4">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  navigate(`/${user?.role}/dashboard`);
                  setIsMenuOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  openAuthModal("login");
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  openAuthModal("signup");
                  setIsMenuOpen(false);
                }}
              >
                Register
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
