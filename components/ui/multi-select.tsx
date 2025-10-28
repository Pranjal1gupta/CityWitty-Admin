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

interface MultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function MultiSelect({
  value = [],
  onChange,
  options,
  placeholder = "Select options...",
  className,
  emptyMessage = "No options found.",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [showAllSelected, setShowAllSelected] = React.useState(false);

  const handleSelect = React.useCallback(
    (optionValue: string) => {
      if (optionValue === "select-all") {
        if (value.length === options.length) {
          onChange?.([]);
        } else {
          onChange?.(options.map((option) => option.value));
        }
      } else {
        if (value.includes(optionValue)) {
          onChange?.(value.filter((item) => item !== optionValue));
        } else {
          onChange?.([...value, optionValue]);
        }
      }
      setInputValue("");
    },
    [value, onChange, options]
  );

  const handleRemove = React.useCallback(
    (optionValue: string) => {
      onChange?.(value.filter((item) => item !== optionValue));
    },
    [value, onChange]
  );

  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        handleSelect(inputValue.trim());
      }
    },
    [inputValue, handleSelect]
  );

  // Note: Filtering is now handled by the Command component using searchValue

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
                {value.length} selected
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search options..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.length > 0 && (
                  <CommandItem
                    key="select-all"
                    value="select-all"
                    onSelect={() => handleSelect("select-all")}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.length === options.length ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Select All
                  </CommandItem>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(showAllSelected ? value : value.slice(0, 4)).map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue);
            return (
              <Badge
                key={selectedValue}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300 pr-1"
                onClick={() => handleRemove(selectedValue)}
              >
                {option?.label || selectedValue}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            );
          })}
          {value.length > 4 && !showAllSelected && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300 pr-1"
              onClick={() => setShowAllSelected(true)}
            >
              +{value.length - 4} more
            </Badge>
          )}
          {showAllSelected && value.length > 4 && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300 pr-1"
              onClick={() => setShowAllSelected(false)}
            >
              Show less
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
