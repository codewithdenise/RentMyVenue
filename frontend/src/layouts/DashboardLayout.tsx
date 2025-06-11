import * as React from "react";
import { useState } from "react";

import {
  Home,
  CalendarDays,
  User as UserIcon,
  Building2,
  Banknote,
  Search,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

type SidebarItemType = {
  title: string;
  icon: React.ReactNode;
  href: string;
  userRoles?: string[];
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Create sidebar navigation based on user role
  const sidebarItems: SidebarItemType[] = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: `/${user?.role}/dashboard`,
    },
    {
      title: "Bookings",
      icon: <CalendarDays className="h-5 w-5" />,
      href: `/${user?.role}/bookings`,
    },
    {
      title: "Profile",
      icon: <UserIcon className="h-5 w-5" />,
      href: `/${user?.role}/profile`,
    },
    {
      title: "Venues",
      icon: <Building2 className="h-5 w-5" />,
      href: `/vendor/venues`,
      userRoles: ["vendor", "admin"],
    },
    {
      title: "Finances",
      icon: <Banknote className="h-5 w-5" />,
      href: `/vendor/finances`,
      userRoles: ["vendor"],
    },
    {
      title: "Browse Venues",
      icon: <Search className="h-5 w-5" />,
      href: `/venues`,
      userRoles: ["user"],
    },
    {
      title: "User Management",
      icon: <UserIcon className="h-5 w-5" />,
      href: `/admin/users`,
      userRoles: ["admin"],
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      href: `/admin/reports`,
      userRoles: ["admin"],
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: `/${user?.role}/settings`,
    },
  ];

  // Filter sidebar items by user role
  const filteredSidebarItems = sidebarItems.filter((item) => {
    // If no roles are specified, show to everyone
    if (!item.userRoles) return true;
    // Otherwise, check if user has required role
    return user && item.userRoles.includes(user.role);
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Close sidebar on mobile when clicking a link
  const handleNavLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out",
          {
            "translate-x-0": sidebarOpen,
            "-translate-x-full": !sidebarOpen,
          },
          "md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredSidebarItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={handleNavLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )
                    }
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto bg-background",
          sidebarOpen ? "md:ml-64" : "",
        )}
      >
        <div className="min-h-screen p-4 md:p-8">{children || <Outlet />}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
