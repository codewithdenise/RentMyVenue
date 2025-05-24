import React, { useContext } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModalType } from "@/components/auth/AuthModals";

type MainLayoutContext = {
  openAuthModal: (type: AuthModalType) => void;
};

interface MainLayoutProps {
  children?: React.ReactNode;
  onOpenAuthModal?: (type: AuthModalType) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onOpenAuthModal,
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onOpenAuthModal={onOpenAuthModal} />
      <main className="flex-1">
        {children || <Outlet context={{ openAuthModal: onOpenAuthModal }} />}
      </main>
      <Footer />
    </div>
  );
};

// Custom hook to access the auth modal controls from child routes
export const useAuthModal = () => {
  return useOutletContext<MainLayoutContext>();
};

export default MainLayout;
