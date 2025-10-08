import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Palette, DollarSign, Package } from "lucide-react";

interface Variant {
  variantId?: string;
  name: string;
  price: string;
  stock: string;
  isAvailableStock: boolean;
}

interface VariantsTabProps {
  productVariants: Variant[];
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: string, value: any) => void;
  fieldErrors?: { variantStockSum?: string };
}

export const VariantsTab: React.FC<VariantsTabProps> = ({
  productVariants,
  addVariant,
  removeVariant,
  updateVariant,
  fieldErrors,
}) => {
  const ToggleButton = ({
    id,
    checked,
    onCheckedChange,
    label,
    icon: Icon,
    description
  }: {
    id?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    icon?: React.ComponentType<any>;
    description?: string;
  }) => (
    <div className="group">
      <div
        className={`relative flex items-center justify-between p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer lg:mt-7 ${
          checked
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`p-2 rounded-full transition-colors duration-300 ${
              checked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon size={20} />
            </div>
          )}
          <div>
            <Label htmlFor={id} className={`text-sm font-medium cursor-pointer px-2 ${
              checked ? 'text-indigo-900' : 'text-gray-700'
            }`}>
              {label}
            </Label>
            {description && (
              <p className={`text-xs mt-1 ${
                checked ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {productVariants.map((variant, index) => (
        <div key={index} className="border rounded-lg p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-lg">Variant {index + 1}</h4>
            {productVariants.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => removeVariant(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Variant ID</Label>
              <Input
                value={variant.variantId}
                disabled
                placeholder="Auto-generated"
                className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Variant Name</Label>
              <Input
                value={variant.name}
                onChange={(e) =>
                  updateVariant(index, "name", e.target.value)
                }
                placeholder="e.g., Small, Red"
                className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Price</Label>
              <Input
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) =>
                  updateVariant(index, "price", e.target.value)
                }
                placeholder="0.00"
                className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Stock</Label>
              <Input
                type="number"
                value={variant.stock}
                onChange={(e) =>
                  updateVariant(index, "stock", e.target.value)
                }
                placeholder="0"
                min={0}
                className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
              {/* Display error if sum of variant stocks exceeds total available stocks */}
              {fieldErrors?.variantStockSum && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.variantStockSum}</p>
              )}
            </div>
            <div className="flex items-center space-x-5">
              <ToggleButton
                checked={variant.isAvailableStock}
                onCheckedChange={(checked) =>
                  updateVariant(index, "isAvailableStock", checked)
                }
                label="Available Stock "
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-100"
        onClick={addVariant}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Variant
      </Button>
    </div>
  );
};
