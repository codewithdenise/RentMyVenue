import * as React from "react";

import { Facebook, Instagram, Twitter, Mail, PhoneCall, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";


interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  return (
    <footer className={cn("bg-card text-card-foreground", className)}>
      <div className="container mx-auto px-4 py-10">
        {/* Top section with logo and information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link to="/" className="inline-block font-bold text-xl">
              RentMyVenue
            </Link>
            <p className="text-muted-foreground text-sm">
              The perfect platform to find and book the ideal wedding venue for
              your special day. From elegant ballrooms to rustic barns, we have
              it all.
            </p>
            <div className="flex space-x-4">
              <button 
                type="button" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Visit our Facebook page"
              >
                <Facebook size={20} />
              </button>
              <button 
                type="button" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Visit our Instagram page"
              >
                <Instagram size={20} />
              </button>
              <button 
                type="button" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Visit our Twitter page"
              >
                <Twitter size={20} />
              </button>
            </div>
          </div>

          {/* Discover links */}
          <div>
            <h3 className="font-medium text-base mb-4">Discover</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/venues"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/featured-venues"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Featured Venues
                </Link>
              </li>
              {!isAuthenticated && (
                <li>
                  <Link
                    to="/become-a-host"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Become a Host
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact us */}
          <div>
            <h3 className="font-medium text-base mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                Deoshukla2017@gmail.com
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <PhoneCall className="mr-2 h-4 w-4" />
                +91 99351 47351
              </li>
              <li className="flex items-center text-sm text-muted-foreground mt-4">
                <MapPin className="mr-2 h-4 w-4" />
                C9/22, Ansal Api, Lucknow, UP 226030
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with copyright and links */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RentMyVenue. All rights
              reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
