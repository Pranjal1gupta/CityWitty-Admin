import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LocationMultiSelect } from "@/components/ui/location-multi-select";
import { EtaOptions } from "@/app/types/ecommerce";
import { Shield, RefreshCw, MapPin, Clock, FileText } from "lucide-react";

interface WarrantyDeliveryTabProps {
  addForm: any;
  setAddForm: (form: any) => void;
  fieldErrors: any;
  validateFields: () => void;
}

export const WarrantyDeliveryTab: React.FC<WarrantyDeliveryTabProps> = ({
  addForm,
  setAddForm,
  fieldErrors,
  validateFields,
}) => {
  const ToggleButton = ({
    id,
    checked,
    onCheckedChange,
    label,
    icon: Icon,
    description
  }: {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    icon: React.ComponentType<any>;
    description?: string;
  }) => (
    <div className="group">
      <div
        className={`relative flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
          checked
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full transition-colors duration-300 ${
            checked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            <Icon size={20} />
          </div>
          <div>
            <Label htmlFor={id} className={`text-sm font-medium cursor-pointer ${
              checked ? 'text-green-900' : 'text-gray-700'
            }`}>
              {label}
            </Label>
            {description && (
              <p className={`text-xs mt-1 ${
                checked ? 'text-green-600' : 'text-gray-500'
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          checked ? 'bg-green-600' : 'bg-gray-200'
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
      <ToggleButton
        id="isWarranty"
        checked={addForm.isWarranty}
        onCheckedChange={(checked) => setAddForm({ ...addForm, isWarranty: checked })}
        label="Warranty Available"
        icon={Shield}
        description="Warranty available for this product"
      />
      {addForm.isWarranty && (
        <div>
          <Label htmlFor="warrantyDescription" className="text-sm font-medium">
            Warranty Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="warrantyDescription"
            value={addForm.warrantyDescription}
            onChange={(e) =>
              setAddForm({
                ...addForm,
                warrantyDescription: e.target.value,
              })
            }
            onBlur={() => validateFields()}
            className={`mt-2 w-full resize-none rounded border p-2 text-sm ${
              fieldErrors.warrantyDescription ? 'border-red-500 animate-pulse' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Enter warranty details"
          />
          {fieldErrors.warrantyDescription && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.warrantyDescription}</p>
          )}
        </div>
      )}
      <ToggleButton
        id="isReplacement"
        checked={addForm.isReplacement}
        onCheckedChange={(checked) => setAddForm({ ...addForm, isReplacement: checked })}
        label="Replacement Available"
        icon={RefreshCw}
        description="Replacement available for this product"
      />
      {addForm.isReplacement && (
        <div>
          <Label htmlFor="replacementDays" className="text-sm font-medium">
            Replacement Days <span className="text-red-500">*</span>
          </Label>
          <Input
            id="replacementDays"
            type="number"
            value={addForm.replacementDays}
            onChange={(e) =>
              setAddForm({
                ...addForm,
                replacementDays: e.target.value,
              })
            }
            onBlur={() => validateFields()}
            className={`mt-2 w-full rounded border p-2 text-sm ${
              fieldErrors.replacementDays ? 'border-red-500 animate-pulse' : 'border-gray-300'
            }`}
            placeholder="Number of days"
          />
          {fieldErrors.replacementDays && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.replacementDays}</p>
          )}
        </div>
      )}

      <div>
        <Label>
          Deliverable Locations{" "}
          <span className="text-red-500">*</span> (At least 1 location)
        </Label>
        <LocationMultiSelect
          value={addForm.deliverableLocations}
          onChange={(locations) => {
            setAddForm({
              ...addForm,
              deliverableLocations: locations,
            });
            validateFields();
          }}
          placeholder="Select deliverable locations"
          className={fieldErrors.deliverableLocations ? 'border-red-500 animate-pulse' : ''}
        />
        {fieldErrors.deliverableLocations && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.deliverableLocations}</p>
        )}
      </div>
      <div>
        <Label htmlFor="eta">
          ETA (Delivery Timeline) <span className="text-red-500">*</span>
        </Label>
        <Select
        
          value={addForm.eta ? EtaOptions.find(option => `${option.label}: ${option.eta}` === addForm.eta)?.label || "" : ""}
          onValueChange={(value) => {
            const selectedOption = EtaOptions.find(option => option.label === value);
            if (selectedOption) {
              setAddForm({ ...addForm, eta: `${selectedOption.label}: ${selectedOption.eta}` });
            }
            validateFields();
          }}
        >
          <SelectTrigger id="eta" className={fieldErrors.eta ? 'border-red-500 animate-pulse' : '' }>
            <SelectValue placeholder="Select ETA option" />
          </SelectTrigger>
          <SelectContent>
            {EtaOptions.map((option) => (
              <SelectItem key={option.label} value={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.eta && (
          <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.eta}</p>
        )}
      </div>
    </div>
  );
};
