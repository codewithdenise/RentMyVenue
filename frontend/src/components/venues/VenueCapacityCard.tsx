import * as React from "react";

import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VenueCapacityCardProps {
  minCapacity: number;
  maxCapacity: number;
  className?: string;
  theme?: "default" | "highlight";
}

const VenueCapacityCard: React.FC<VenueCapacityCardProps> = ({
  minCapacity,
  maxCapacity,
  className,
  theme = "default",
}) => {
  const recommendedCapacity = Math.round((minCapacity + maxCapacity) / 2);

  return (
    <Card
      className={cn(
        "overflow-hidden",
        theme === "highlight" ? "border-primary/50" : "",
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Guest Capacity
            </h3>
            <p className="text-muted-foreground text-sm">
              This venue accommodates {minCapacity}-{maxCapacity} guests
            </p>
          </div>
          {theme === "highlight" && (
            <Badge className="bg-primary">Perfect For Weddings</Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Minimum</div>
            <div className="font-bold text-lg">{minCapacity}</div>
            <div className="text-xs text-muted-foreground">Guests</div>
          </div>
          <div
            className={cn(
              "p-3 rounded-md",
              theme === "highlight"
                ? "bg-primary text-primary-foreground"
                : "bg-accent",
            )}
          >
            <div
              className={cn(
                "text-sm",
                theme === "highlight"
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground",
              )}
            >
              Recommended
            </div>
            <div className="font-bold text-lg">{recommendedCapacity}</div>
            <div
              className={cn(
                "text-xs",
                theme === "highlight"
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground",
              )}
            >
              Guests
            </div>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Maximum</div>
            <div className="font-bold text-lg">{maxCapacity}</div>
            <div className="text-xs text-muted-foreground">Guests</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {maxCapacity >= 300 ? (
            <p>✓ Suitable for large wedding ceremonies and grand receptions</p>
          ) : maxCapacity >= 150 ? (
            <p>✓ Perfect for medium-sized weddings with family and friends</p>
          ) : (
            <p>✓ Ideal for intimate weddings with close family and friends</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueCapacityCard;
