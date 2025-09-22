"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Comprehensive list of common locations
const COMMON_LOCATIONS = [
  // North India
  "Delhi", "New Delhi", "Gurgaon", "Noida", "Ghaziabad", "Faridabad",
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Navi Mumbai",
  "Jaipur", "Jodhpur", "Udaipur", "Kota",
  "Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut",
  "Chandigarh", "Amritsar", "Ludhiana", "Jalandhar",
  "Dehradun", "Haridwar", "Rishikesh",
  "Srinagar", "Jammu",

  // South India
  "Bangalore", "Bengaluru", "Chennai", "Hyderabad", "Secunderabad",
  "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur",
  "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Mysore", "Mangalore", "Hubli", "Belgaum",
  "Visakhapatnam", "Vijayawada", "Guntur", "Nellore",
  "Warangal", "Karimnagar", "Nizamabad",

  // East India
  "Kolkata", "Howrah", "Durgapur", "Asansol",
  "Bhubaneswar", "Cuttack", "Rourkela", "Puri",
  "Patna", "Gaya", "Bhagalpur", "Muzaffarpur",
  "Guwahati", "Dispur", "Silchar", "Dibrugarh",
  "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro",

  // West India
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
  "Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain",
  "Raipur", "Bhilai", "Bilaspur", "Korba",

  // Central India
  "Kanpur", "Allahabad", "Lucknow", "Varanasi", "Agra",

  // International (Popular for remote work)
  "New York", "London", "Toronto", "Sydney", "Singapore", "Dubai",
  "San Francisco", "Seattle", "Austin", "Boston", "Chicago", "Los Angeles",
  "Berlin", "Amsterdam", "Stockholm", "Copenhagen", "Zurich", "Vienna",
  "Tokyo", "Seoul", "Hong Kong", "Shanghai", "Beijing",
  "Melbourne", "Brisbane", "Perth", "Auckland", "Wellington"
];

interface LocationMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function LocationMultiSelect({
  value = [],
  onChange,
  placeholder = "Select locations...",
  className,
}: LocationMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = React.useCallback((location: string) => {
    if (!value.includes(location)) {
      onChange?.([...value, location]);
    }
    setInputValue("");
  }, [value, onChange]);

  const handleRemove = React.useCallback((location: string) => {
    onChange?.(value.filter((item) => item !== location));
  }, [value, onChange]);

  const handleInputKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleSelect(inputValue.trim());
    }
  }, [inputValue, handleSelect]);

  // Filter locations based on input
  const filteredLocations = React.useMemo(() => {
    if (!inputValue) return COMMON_LOCATIONS;
    return COMMON_LOCATIONS.filter((location) =>
      location.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue]);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length === 0 ? (
              placeholder
            ) : (
              <span className="truncate">
                {value.length} location{value.length > 1 ? "s" : ""} selected
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search locations..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                {inputValue.trim() ? (
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelect(inputValue.trim())}
                      className="w-full justify-start"
                    >
                      Add "{inputValue.trim()}"
                    </Button>
                  </div>
                ) : (
                  "No locations found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredLocations.map((location) => (
                  <CommandItem
                    key={location}
                    value={location}
                    onSelect={() => handleSelect(location)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(location) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300 pr-1"
              onClick={() => handleRemove(location)}
            >
              {location}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
