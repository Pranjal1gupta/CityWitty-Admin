import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus, Package, Image, FileText, Tag, Box, Star } from "lucide-react";
import { productCategories } from "@/app/types/ecommerce";

interface BasicInfoTabProps {
  addForm: any;
  setAddForm: (form: any) => void;
  fieldErrors: any;
  validateFields: () => void;
  uploadingImages: boolean;
  handleImageUpload: (files: FileList) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  addForm,
  setAddForm,
  fieldErrors,
  validateFields,
  uploadingImages,
  handleImageUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Package size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="productId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={16} className="text-gray-500" />
              Product ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productId"
              value={addForm.productId}
              disabled
              placeholder="Auto-generated"
              className="mt-2 bg-gray-50 border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              value={addForm.productName}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productName: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 ${fieldErrors.productName ? 'border-red-500 animate-pulse' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500'}`}
              placeholder="Enter product name"
            />
            {fieldErrors.productName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.productName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Images Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Image size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
        </div>
        <input
          id="productImages"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              handleImageUpload(files);
            }
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:cursor-pointer hover:file:bg-gray-700 transition-all duration-200"
          disabled={uploadingImages}
        />
        {uploadingImages && (
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            Uploading images...
          </p>
        )}
        {addForm.productImages.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {addForm.productImages.map((url: string, idx: number) => (
              <div
                key={idx}
                className="relative group w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={url}
                  alt={`Product Image ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAddForm({
                      ...addForm,
                      productImages:
                        addForm.productImages.filter((_: string, i: number) => i !== idx),
                    });
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description and Category Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <FileText size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Description & Category</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="productDescription" className="text-sm font-medium text-gray-700">
              Product Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="productDescription"
              value={addForm.productDescription}
              onChange={(e) =>
                setAddForm({
                  ...addForm,
                  productDescription: e.target.value,
                })
              }
              onBlur={() => validateFields()}
              className={`mt-2 resize-none ${fieldErrors.productDescription ? 'border-red-500 animate-pulse' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500'}`}
              placeholder="Enter detailed product description"
              rows={4}
            />
            {fieldErrors.productDescription && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.productDescription}</p>
            )}
          </div>
          <div>
            <Label htmlFor="productCategory" className="text-sm font-medium text-gray-700">
              Product Category <span className="text-red-500">*</span>
            </Label>
            <Combobox
              value={addForm.productCategory}
              onChange={(value) => {
                setAddForm({ ...addForm, productCategory: value });
                validateFields();
              }}
              options={productCategories}
              placeholder="Select a category"
              searchPlaceholder="Search categories..."
              emptyMessage="No categories found."
              className={`mt-2 ${fieldErrors.productCategory ? 'border-red-500 animate-pulse' : ''}`}
            />
            {fieldErrors.productCategory && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.productCategory}</p>
            )}
          </div>
        </div>
      </div>

      {/* Brand Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Tag size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Brand Information</h3>
        </div>
        <div>
          <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand Name</Label>
          <Input
            id="brand"
            value={addForm.brand}
            onChange={(e) =>
              setAddForm({ ...addForm, brand: e.target.value })
            }
            placeholder="Enter brand name"
            className="mt-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* What's Inside the Box Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Box size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">What's Inside the Box <span className="text-red-500">*</span></h3>
        </div>
        <div className="space-y-3">
          {addForm.whatsInsideTheBox.map((item: string, index: number) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <span className="text-sm font-medium text-gray-600 min-w-[60px]">Item {index + 1}:</span>
              <Input
                value={item}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    whatsInsideTheBox: addForm.whatsInsideTheBox.map((it: string, i: number) =>
                      i === index ? e.target.value : it
                    ),
                  })
                }
                placeholder={`Enter item ${index + 1}`}
                className={`flex-1 ${fieldErrors.whatsInsideTheBox ? 'border-red-500 animate-pulse' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500'}`}
              />
              {addForm.whatsInsideTheBox.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddForm({
                      ...addForm,
                      whatsInsideTheBox: addForm.whatsInsideTheBox.filter((_: string, i: number) => i !== index),
                    });
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {fieldErrors.whatsInsideTheBox && (
            <p className="text-red-500 text-sm">{fieldErrors.whatsInsideTheBox}</p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAddForm({
                ...addForm,
                whatsInsideTheBox: [...addForm.whatsInsideTheBox, ""],
              });
            }}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Product Highlights Section */}
      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Star size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Product Highlights</h3>
        </div>
        <div className="space-y-3">
          {addForm.productHighlights.map((highlight: string, index: number) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <span className="text-sm font-medium text-gray-600 min-w-[80px]">Highlight {index + 1}:</span>
              <Input
                value={highlight}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    productHighlights: addForm.productHighlights.map((h: string, i: number) =>
                      i === index ? e.target.value : h
                    ),
                  })
                }
                placeholder={`Enter highlight ${index + 1}`}
                className="flex-1 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
              {addForm.productHighlights.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddForm({
                      ...addForm,
                      productHighlights: addForm.productHighlights.filter((_: string, i: number) => i !== index),
                    });
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAddForm({
                ...addForm,
                productHighlights: [...addForm.productHighlights, ""],
              });
            }}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Highlight
          </Button>
        </div>
      </div>
    </div>
  );
};
