import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Store, Shield, Wallet, Star, TrendingUp, Award, Info } from "lucide-react";

interface AdditionalTabProps {
  addForm: any;
  setAddForm: (form: any) => void;
}

export const AdditionalTab: React.FC<AdditionalTabProps> = ({
  addForm,
  setAddForm,
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
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full transition-colors duration-300 ${
            checked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
          }`}>
            <Icon size={20} />
          </div>
          <div>
            <Label htmlFor={id} className={`text-sm font-medium cursor-pointer ${
              checked ? 'text-blue-900' : 'text-gray-700'
            }`}>
              {label}
            </Label>
            {description && (
              <p className={`text-xs mt-1 ${
                checked ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <ToggleButton
        id="instore"
        checked={addForm.instore}
        onCheckedChange={(checked) => setAddForm({ ...addForm, instore: checked })}
        label="Instore Available"
        icon={Store}
        description="Product available for in-store pickup"
      />

      <ToggleButton
        id="cityWittyAssured"
        checked={addForm.cityWittyAssured}
        onCheckedChange={(checked) => setAddForm({ ...addForm, cityWittyAssured: checked })}
        label="CityWitty Assured"
        icon={Shield}
        description="Official quality assurance badge"
      />

      <ToggleButton
        id="isWalletCompatible"
        checked={addForm.isWalletCompatible}
        onCheckedChange={(checked) => setAddForm({ ...addForm, isWalletCompatible: checked })}
        label="Wallet Compatible"
        icon={Wallet}
        description="Supports digital wallet payments"
      />

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <Label htmlFor="cashbackPoints" className="text-sm font-medium text-purple-900 flex items-center gap-2">
          <Star size={16} className="text-purple-600" />
          Cashback Points to be awarded
        </Label>
        <Input
          id="cashbackPoints"
          type="number"
          value={addForm.cashbackPoints}
          onChange={(e) => setAddForm({ ...addForm, cashbackPoints: e.target.value })}
          placeholder="0"
          className="mt-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <ToggleButton
        id="isPriority"
        checked={addForm.isPriority}
        onCheckedChange={(checked) => setAddForm({ ...addForm, isPriority: checked })}
        label="Priority Product"
        icon={TrendingUp}
        description="Featured in priority listings"
      />

      <ToggleButton
        id="sponsored"
        checked={addForm.sponsored}
        onCheckedChange={(checked) => setAddForm({ ...addForm, sponsored: checked })}
        label="Sponsored"
        icon={Award}
        description="Paid promotional placement"
      />

      <ToggleButton
        id="bestsellerBadge"
        checked={addForm.bestsellerBadge}
        onCheckedChange={(checked) => setAddForm({ ...addForm, bestsellerBadge: checked })}
        label="Bestseller Badge"
        icon={Award}
        description="Highlight as top-selling product"
      />

      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
        <Label htmlFor="additionalInfo" className="text-sm font-medium text-green-900 flex items-center gap-2">
          <Info size={16} className="text-green-600" />
          Additional Info
        </Label>
        <Textarea
          id="additionalInfo"
          value={addForm.additionalInfo}
          onChange={(e) => setAddForm({ ...addForm, additionalInfo: e.target.value })}
          rows={3}
          className="mt-2 border-green-300 focus:border-green-500 focus:ring-green-500 resize-none"
          placeholder="Enter any additional information about the product..."
        />
      </div>
    </div>
  );
};
