import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Package, Truck, Ruler, Box } from "lucide-react";

interface PricingTabProps {
  addForm: any;
  setAddForm: (form: any) => void;
  fieldErrors: any;
  validateFields: () => void;
}

export const PricingTab: React.FC<PricingTabProps> = ({
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
    id?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    icon?: React.ComponentType<any>;
    description?: string;
  }) => (
    <div className="group">
      <div
        className={`relative flex items-center justify-between p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer lg:mt-3 ${
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
            <Label htmlFor={id} className={`text-sm font-medium cursor-pointer ${
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
      {/* Pricing Information Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Pricing Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label
              htmlFor="originalPrice"
              className="text-sm font-medium text-gray-700"
            >
              Original Price <span className="text-red-500">*</span>
            </Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              value={addForm.originalPrice}
              onChange={(e) => {
                const originalPriceValue = parseFloat(e.target.value) || 0;
                let updatedDiscountedPrice = addForm.discountedPrice;
                let updatedDiscountPercent = addForm.discountOfferedOnProduct;

                if (addForm.discountedPrice && originalPriceValue > 0) {
                  const discountedPriceValue = parseFloat(addForm.discountedPrice) || 0;
                  updatedDiscountPercent = (((originalPriceValue - discountedPriceValue) / originalPriceValue) * 100).toFixed(2);
                } else if (addForm.discountOfferedOnProduct && originalPriceValue > 0) {
                  const discountPercentValue = parseFloat(addForm.discountOfferedOnProduct) || 0;
                  updatedDiscountedPrice = (originalPriceValue - (originalPriceValue * discountPercentValue / 100)).toFixed(2);
                }

                setAddForm({
                  ...addForm,
                  originalPrice: e.target.value,
                  discountedPrice: updatedDiscountedPrice,
                  discountOfferedOnProduct: updatedDiscountPercent,
                });
              }}
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.originalPrice
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="0.00"
            />
            {fieldErrors.originalPrice && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.originalPrice}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="discountedPrice"
              className="text-sm font-medium text-gray-700"
            >
              Discounted Price
            </Label>
            <Input
              id="discountedPrice"
              type="number"
              step="1"
              value={addForm.discountedPrice}
              onChange={(e) => {
                const discountedPrice = parseFloat(e.target.value) || 0;
                const originalPrice = parseFloat(addForm.originalPrice) || 0;
                let discountPercent = '';
                if (originalPrice > 0) {
                  discountPercent = (((originalPrice - discountedPrice) / originalPrice) * 100).toFixed(2);
                }
                setAddForm({
                  ...addForm,
                  discountedPrice: e.target.value,
                  discountOfferedOnProduct: discountPercent,
                });
              }}
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.discountedPrice
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="0.00"
            />
            {fieldErrors.discountedPrice && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.discountedPrice}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="discountOfferedOnProduct"
              className="text-sm font-medium text-gray-700"
            >
              Discount Offered (%)
            </Label>
            <Input
              id="discountOfferedOnProduct"
              type="number"
              step="1"
              value={addForm.discountOfferedOnProduct}
              onChange={(e) => {
                const discountPercent = parseFloat(e.target.value) || 0;
                const originalPrice = parseFloat(addForm.originalPrice) || 0;
                const discountedPrice = (originalPrice - (originalPrice * discountPercent / 100)).toFixed(2);
                setAddForm({
                  ...addForm,
                  discountOfferedOnProduct: discountPercent.toFixed(2),
                  discountedPrice: discountedPrice,
                });
              }}
              onBlur={() => validateFields()}
              className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Inventory & Fees Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Package size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Inventory & Fees
          </h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="availableStocks"
                className="text-sm font-medium text-gray-700"
              >
                Total Available Stocks <span className="text-red-500">*</span>
              </Label>
              <Input
                id="availableStocks"
                type="number"
                value={addForm.availableStocks}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    availableStocks: e.target.value,
                  })
                }
                onBlur={() => validateFields()}
                className={`mt-0 ${
                  fieldErrors.availableStocks
                    ? "border-red-500 animate-pulse"
                    : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                }`}
                placeholder="0"
              />
              {fieldErrors.availableStocks && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.availableStocks}
                </p>
              )}
            </div>
            <div className="mt-2">
              <ToggleButton
                checked={addForm.isAvailableStock}
                onCheckedChange={(checked) =>
                  setAddForm({
                    ...addForm,
                    isAvailableStock: checked,
                  })
                }
                label="Available Stock"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="deliveryFee"
                className="text-sm font-medium text-gray-700"
              >
                Delivery Fee
              </Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={addForm.deliveryFee}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    deliveryFee: e.target.value,
                  })
                }
                className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label
                htmlFor="orderHandlingFee"
                className="text-sm font-medium text-gray-700"
              >
                Order Handling Fee
              </Label>
              <Input
                id="orderHandlingFee"
                type="number"
                step="0.01"
                value={addForm.orderHandlingFee}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    orderHandlingFee: e.target.value,
                  })
                }
                className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="offerApplicable"
              className="text-sm font-medium text-gray-700"
            >
              Additional Offer Applicable
            </Label>
            <Input
              id="offerApplicable"
              value={addForm.offerApplicable}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  offerApplicable: e.target.value,
                })
              }
              className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              placeholder="e.g., Festival Sale, Buy 1 Get 1 free, No Offer"
            />
          </div>
        </div>
      </div>

      {/* Product Dimensions Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Ruler size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Product Dimensions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label
              htmlFor="productHeight"
              className="text-sm font-medium text-gray-700"
            >
              Product Height <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productHeight"
              type="number"
              step="0.01"
              value={addForm.productHeight}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productHeight: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.productHeight
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="cm"
            />
            {fieldErrors.productHeight && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.productHeight}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="productWidth"
              className="text-sm font-medium text-gray-700"
            >
              Product Width <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productWidth"
              type="number"
              step="0.01"
              value={addForm.productWidth}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productWidth: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.productWidth
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="cm"
            />
            {fieldErrors.productWidth && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.productWidth}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="productWeight"
              className="text-sm font-medium text-gray-700"
            >
              Product Weight <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productWeight"
              type="number"
              step="0.01"
              value={addForm.productWeight}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productWeight: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.productWeight
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="kg"
            />
            {fieldErrors.productWeight && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.productWeight}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="productPackageWeight"
              className="text-sm font-medium text-gray-700"
            >
              Package Weight <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productPackageWeight"
              type="number"
              step="0.01"
              value={addForm.productPackageWeight}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productPackageWeight: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.productPackageWeight
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="kg"
            />
            {fieldErrors.productPackageWeight && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.productPackageWeight}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Package Dimensions Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Box size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Package Dimensions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="productPackageHeight"
              className="text-sm font-medium text-gray-700"
            >
              Package Height <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productPackageHeight"
              type="number"
              step="0.01"
              value={addForm.productPackageHeight}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productPackageHeight: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.productPackageHeight
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="cm"
            />
            {fieldErrors.productPackageHeight && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.productPackageHeight}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="productPackageWidth"
              className="text-sm font-medium text-gray-700"
            >
              Package Width <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productPackageWidth"
              type="number"
              step="0.01"
              value={addForm.productPackageWidth}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productPackageWidth: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${
                fieldErrors.productPackageWidth
                  ? "border-red-500 animate-pulse"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="cm"
            />
            {fieldErrors.productPackageWidth && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.productPackageWidth}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
