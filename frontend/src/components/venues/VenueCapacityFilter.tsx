import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VenueCapacityFilterProps {
  onChange: (capacity: number) => void;
  defaultValue?: number;
}

const presetCapacities = [
  { label: "50+", value: 50 },
  { label: "100+", value: 100 },
  { label: "200+", value: 200 },
  { label: "300+", value: 300 },
  { label: "500+", value: 500 },
];

const VenueCapacityFilter: React.FC<VenueCapacityFilterProps> = ({
  onChange,
  defaultValue = 0,
}) => {
  const [capacity, setCapacity] = useState<number>(defaultValue);
  const [customCapacity, setCustomCapacity] = useState<string>(
    defaultValue ? defaultValue.toString() : "",
  );

  const handlePresetSelect = (value: number) => {
    setCapacity(value);
    setCustomCapacity(value.toString());
    onChange(value);
  };

  const handleCustomCapacityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setCustomCapacity(value);

    // Only update if it's a valid number
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCapacity(numValue);
      onChange(numValue);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <Label className="font-medium text-foreground">
              Guest Capacity
            </Label>
          </div>

          {/* Preset capacity buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={capacity === 0 ? "secondary" : "outline"}
              size="sm"
              onClick={() => handlePresetSelect(0)}
              className="rounded-full"
            >
              Any
            </Button>

            {presetCapacities.map((preset) => (
              <Button
                key={preset.value}
                variant={capacity === preset.value ? "secondary" : "outline"}
                size="sm"
                onClick={() => handlePresetSelect(preset.value)}
                className="rounded-full"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom capacity input */}
          <div className="pt-2">
            <Label
              htmlFor="custom-capacity"
              className="text-sm text-muted-foreground"
            >
              Custom Capacity
            </Label>
            <div className="flex items-center mt-1">
              <Input
                id="custom-capacity"
                type="number"
                min="0"
                placeholder="Enter exact number"
                value={customCapacity}
                onChange={handleCustomCapacityChange}
                className="rounded-md"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueCapacityFilter;
