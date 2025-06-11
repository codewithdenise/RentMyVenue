import * as React from "react";

import { MapPin, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Venue } from "@/types";

interface RuralVenueCardProps {
  venue: Venue;
}

const RuralVenueCard: React.FC<RuralVenueCardProps> = ({ venue }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col border border-border hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img
          src={venue.images[0]?.url}
          alt={venue.name}
          className="h-52 w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-lg font-bold text-white">{venue.name}</h3>
          <div className="flex items-center text-white/90 text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            {venue.address.city}, {venue.address.state}
          </div>
        </div>
      </div>

      <CardContent className="py-4 flex-grow">
        <div className="flex items-center gap-1 mb-3 bg-muted/50 p-2 rounded-lg">
          <Users className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium">
            Accommodates <strong>{venue.capacity.max}</strong> guests
          </span>
        </div>

        <p className="text-sm text-foreground/90 line-clamp-3">
          {venue.shortDescription ||
            venue.description.substring(0, 120) + "..."}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-border pt-3 pb-3 bg-muted/30">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-accent mr-1" />
          <span className="text-sm font-medium">
            ₹{venue.pricePerDay.toLocaleString("en-IN")}/day
          </span>
        </div>
        <Link to={`/venues/${venue.id}`}>
          <Button variant="default" size="sm" className="text-xs">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RuralVenueCard;
