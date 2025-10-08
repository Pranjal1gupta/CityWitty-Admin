import React, { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BasicInfoTab } from "./BasicInfoTab";
import { PricingTab } from "./PricingTab";
import { VariantsTab } from "./VariantsTab";
import { WarrantyDeliveryTab } from "./WarrantyDeliveryTab";
import { FaqTab } from "./FaqTab";
import { AdditionalTab } from "./AdditionalTab";

interface AddProductDialogProps {
  addForm: any;
  setAddForm: (form: any) => void;
  fieldErrors: any;
  uploadingImages: boolean;
  validateFields: () => void;
  allFieldsValid: () => boolean;
  hasFormData: () => boolean;
  resetForm: () => void;
  handleImageUpload: (files: FileList) => void;
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: string, value: any) => void;
  addHighlight: () => void;
  removeHighlight: (index: number) => void;
  updateHighlight: (index: number, value: string) => void;
  addWhatsInsideItem: () => void;
  removeWhatsInsideItem: (index: number) => void;
  updateWhatsInsideItem: (index: number, value: string) => void;
  addFaq: () => void;
  removeFaq: (index: number) => void;
  updateFaq: (index: number, field: string, value: any) => void;
  handleProduct: () => void;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditMode: boolean;
  onClose: () => void;
}

export const AddProductDialog: React.FC<AddProductDialogProps> = ({
  addForm,
  setAddForm,
  fieldErrors,
  uploadingImages,
  validateFields,
  allFieldsValid,
  hasFormData,
  resetForm,
  handleImageUpload,
  addVariant,
  removeVariant,
  updateVariant,
  addHighlight,
  removeHighlight,
  updateHighlight,
  addWhatsInsideItem,
  removeWhatsInsideItem,
  updateWhatsInsideItem,
  addFaq,
  removeFaq,
  updateFaq,
  handleProduct,
  setIsAddDialogOpen,
  isEditMode,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("basic-info");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const tabs = [
    "basic-info",
    "pricing",
    "variants",
    "warranty-delivery",
    "faq",
    "additional",
  ];

  const currentIndex = tabs.indexOf(activeTab);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleCancelClick = () => {
    if (hasFormData()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const cancelClose = () => {
    setShowConfirmClose(false);
  };

  return (
    <DialogContent className="max-w-4xl w-[90vw] lg:h-[80vh] lg:overflow-hidden lg:flex lg:flex-col">
      <DialogHeader>
        <DialogTitle className="text-lg md:text-xl">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogDescription className="text-sm md:text-base">
          {isEditMode
            ? "Update the product details to modify the product in the catalog."
            : "Fill in the product details to add a new product to the catalog."}
        </DialogDescription>
      </DialogHeader>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="lg:flex lg:flex-col lg:flex-1 lg:overflow-hidden"
      >
        <div className="flex-shrink-0">
          <div className="overflow-x-auto pb-2 md:overflow-visible">
            <TabsList className="rounded-md p-1 flex flex-row flex-wrap sm:flex-nowrap space-x-1  border-0 bg-transparent lg:p-0 lg:space-x-2 sm:overflow-visible h-16">
              <TabsTrigger
                value="basic-info"
                className="rounded-md px-2 md:px-3 lg:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border data-[state=active]:border-blue-300 whitespace-nowrap"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="rounded-md px-2 md:px-3 lg:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border data-[state=active]:border-blue-300 whitespace-nowrap"
              >
                Pricing & Offers
              </TabsTrigger>
              <TabsTrigger
                value="variants"
                className="rounded-md px-2 md:px-3 lg:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border data-[state=active]:border-blue-300 whitespace-nowrap"
              >
                Variants
              </TabsTrigger>
              <TabsTrigger
                value="warranty-delivery"
                className="rounded-md px-2 md:px-3 lg:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border data-[state=active]:border-blue-300 whitespace-nowrap"
              >
                Warranty & Delivery
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="rounded-md px-2 md:px-3 lg:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border data-[state=active]:border-blue-300 whitespace-nowrap"
              >
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="additional"
                className="rounded-md px-2 md:px-3 lg:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border data-[state=active]:border-blue-300 whitespace-nowrap"
              >
                Additional
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden px-4 md:px-6 md:max-h-none max-h-96">
          <TabsContent value="basic-info">
            <BasicInfoTab
              addForm={addForm}
              setAddForm={setAddForm}
              fieldErrors={fieldErrors}
              validateFields={validateFields}
              uploadingImages={uploadingImages}
              handleImageUpload={handleImageUpload}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingTab
              addForm={addForm}
              setAddForm={setAddForm}
              fieldErrors={fieldErrors}
              validateFields={validateFields}
            />
          </TabsContent>

          <TabsContent value="variants">
            <VariantsTab
              productVariants={addForm.productVariants}
              addVariant={addVariant}
              removeVariant={removeVariant}
              updateVariant={updateVariant}
              fieldErrors={fieldErrors}
            />
          </TabsContent>

          <TabsContent value="warranty-delivery">
            <WarrantyDeliveryTab
              addForm={addForm}
              setAddForm={setAddForm}
              fieldErrors={fieldErrors}
              validateFields={validateFields}
            />
          </TabsContent>

          <TabsContent value="faq">
            <FaqTab
              faq={addForm.faq}
              addFaq={addFaq}
              removeFaq={removeFaq}
              updateFaq={updateFaq}
            />
          </TabsContent>

          <TabsContent value="additional">
            <AdditionalTab addForm={addForm} setAddForm={setAddForm} />
          </TabsContent>
        </div>
      </Tabs>
      <DialogFooter className="flex flex-col lg:justify-items-center
       gap-2 sm:flex-row sm:justify-between flex-shrink-0 lg:py-0 py-4">
        <div className="flex gap-3">
          <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto lg:py-2 py-3"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === tabs.length - 1}
          className="w-full sm:w-auto lg:py-2 py-3"
        >
          Next
        </Button>
        </div>
        
        <div className="flex gap-3">
          <Button
          variant="outline"
          onClick={handleCancelClick}
          className="w-full sm:w-auto lg:py-2 py-3"
        >
          Cancel
        </Button>
        <Button
          onClick={handleProduct}
          className="w-full sm:w-auto bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] lg:py-2 py-3"
        >
          {isEditMode ? "Update Product" : "Add Product"}
        </Button>
        </div>
        
      </DialogFooter>
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close the dialog? All entered data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose} className="bg-red-500 hover:bg-red-800">Close Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  );
};
