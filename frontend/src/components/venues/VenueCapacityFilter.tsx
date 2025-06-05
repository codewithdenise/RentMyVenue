import React from "react";
import { Button } from "@/components/ui/button";

interface VenueCapacityFilterProps {
  selectedCapacity: string;
  onChange: (capacity: string) => void;
}

export const VenueCapacityFilter: React.FC<VenueCapacityFilterProps> = ({
  selectedCapacity,
  onChange,
}) => {
  // Capacity options
  const capacityOptions = [
    { value: "", label: "Any" },
    { value: "50", label: "50+" },
    { value: "100", label: "100+" },
    { value: "200", label: "200+" },
    { value: "300", label: "300+" },
    { value: "500", label: "500+" },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {capacityOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedCapacity === option.value ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VenueCapacityFilter;
