"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Product } from "@/app/types/ecommerce";
import { useProductManagement } from "@/hooks/useProductManagement";
import { useAddProductForm } from "@/hooks/useAddProductForm";
import { EcommerceHeader } from "@/components/ecommerce/EcommerceHeader";
import { ProductFilters } from "@/components/ecommerce/ProductFilters";
import { ProductStats } from "@/components/ecommerce/ProductStats";
import { ProductTable } from "@/components/ecommerce/ProductTable";
import { AddProductDialog } from "@/components/ecommerce/AddProductDialog";
import ProductViewModal from "@/components/ecommerce/ProductViewModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function EcommercePage() {
  const {
    products,
    loading,
    fetchProducts,
    toggleProductStatus,
    updateProduct,
  } = useProductManagement();

  const {
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
    getValidProductVariants,
    getValidProductHighlights,
    getValidFaq,
  } = useAddProductForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showMissingFieldsDialog, setShowMissingFieldsDialog] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const totalOrders = products.reduce((sum, p) => sum + p.sales, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const lowStockCount = products.filter((p) => p.status === "active" && p.stock < 20).length;

  // Filtered products
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.merchant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, rowsPerPage]);

  // Adjust current page if it exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handlers
  const getFieldDisplayName = (field: string) => {
    const fieldNames: { [key: string]: string } = {
      productName: "Product Name",
      productDescription: "Product Description",
      productCategory: "Product Category",
      originalPrice: "Original Price",
      discountedPrice: "Discounted Price",
      availableStocks: "Available Stocks",
      productHeight: "Product Height",
      productWidth: "Product Width",
      productWeight: "Product Weight",
      productPackageWeight: "Package Weight",
      productPackageWidth: "Package Width",
      productPackageHeight: "Package Height",
      whatsInsideTheBox: "What's Inside the Box",
      deliverableLocations: "Deliverable Locations",
      eta: "ETA",
      warrantyDescription: "Warranty Description",
      replacementDays: "Replacement Days",
      productImages: "Product Images",
      variantStockSum: "Variant Stock Sum"
    };
    return fieldNames[field] || field;
  };

  const handleAddProduct = async () => {
    if (!allFieldsValid()) {
      // Collect missing required fields from fieldErrors
      const missingFields = Object.entries(fieldErrors)
        .filter(([_, error]) => error !== '')
        .map(([field, _]) => getFieldDisplayName(field));

      // Show custom popup with missing fields
      setMissingFields(missingFields);
      setShowMissingFieldsDialog(true);
      return;
    }

    const formData = {
      ...addForm,
      productVariants: getValidProductVariants(),
      productHighlights: getValidProductHighlights(),
      faq: getValidFaq()
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Product added successfully");
        resetForm();
        setIsAddDialogOpen(false);
        fetchProducts();
      } else {
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async () => {
    if (!allFieldsValid()) {
      // Collect missing required fields from fieldErrors
      const missingFields = Object.entries(fieldErrors)
        .filter(([_, error]) => error !== '')
        .map(([field, _]) => getFieldDisplayName(field));

      // Show custom popup with missing fields
      setMissingFields(missingFields);
      setShowMissingFieldsDialog(true);
      return;
    }

    if (!selectedProductForEdit) return;

    const formData = {
      ...addForm,
      productVariants: getValidProductVariants(),
      productHighlights: getValidProductHighlights(),
      faq: getValidFaq()
    };

    try {
      const response = await fetch(`/api/products/${selectedProductForEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Product updated successfully");
        resetForm();
        setIsAddDialogOpen(false);
        setIsEditMode(false);
        setSelectedProductForEdit(null);
        fetchProducts();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleEditProduct = (product: Product) => {
    setIsEditMode(true);
    setSelectedProductForEdit(product);
    // Map Product fields to form fields
    setAddForm({
      productId: product.id,
      productName: product.name,
      productImages: product.productImages || [],
      productDescription: product.description,
      productCategory: product.category,
      brand: product.brand || "",
      productHighlights: product.productHighlights || [""],
      productVariants: product.productVariants || [],
      originalPrice: product.price?.toString() || "",
      discountedPrice: product.discountPrice?.toString() || "",
      offerApplicable: product.offerApplicable || "",
      deliveryFee: product.deliveryFee?.toString() || "10",
      orderHandlingFee: product.orderHandlingFee?.toString() || "10",
      discountOfferedOnProduct: product.discountOfferedOnProduct?.toString() || "",
      productHeight: product.productHeight?.toString() || "",
      productWidth: product.productWidth?.toString() || "",
      productWeight: product.productWeight?.toString() || "",
      productPackageWeight: product.productPackageWeight?.toString() || "",
      productPackageHeight: product.productPackageHeight?.toString() || "",
      productPackageWidth: product.productPackageWidth?.toString() || "",
      whatsInsideTheBox: product.whatsInsideTheBox || [""],
      isWarranty: product.isWarranty || false,
      warrantyDescription: product.warrantyDescription || "",
      rating: product.rating || [],
      deliverableLocations: product.deliverableLocations || [],
      eta: product.eta || "",
      faq: product.faq || [],
      instore: product.instore || false,
      cityWittyAssured: product.cityWittyAssured || true,
      isWalletCompatible: product.isWalletCompatible || false,
      cashbackPoints: product.cashbackPoints?.toString() || "",
      isPriority: product.isPriority || false,
      sponsored: product.sponsored || false,
      bestsellerBadge: product.bestsellerBadge || false,
      additionalInfo: product.additionalInfo || "",
      isReplacement: product.isReplacement || false,
      replacementDays: product.replacementDays?.toString() || "",
      isAvailableStock: product.isAvailableStock || true,
      availableStocks: product.stock?.toString() || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleAddProductClick = () => {
    setIsEditMode(false);
    setSelectedProductForEdit(null);
    resetForm();
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProductForView(product);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = async (productId: string, status: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      try {
        await updateProduct({ ...product, status });
        toast.success(`Product status updated to ${status}`);
      } catch (error) {
        toast.error("Failed to update product status");
      }
    }
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    if (isEditMode) {
      setIsEditMode(false);
      setSelectedProductForEdit(null);
      resetForm();
    }
  };

  const handleDialogClose = () => {
    if (hasFormData()) {
      setShowConfirmClose(true);
    } else {
      closeDialog();
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    closeDialog();
  };

  const cancelClose = () => {
    setShowConfirmClose(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <EcommerceHeader
          lowStockCount={lowStockCount}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          onAddClick={() => {
            setIsEditMode(false);
            setSelectedProductForEdit(null);
            resetForm();
          }}
          hasFormData={hasFormData}
          onCloseAttempt={handleDialogClose}
        >
          <AddProductDialog
            addForm={addForm}
            setAddForm={setAddForm}
            fieldErrors={fieldErrors}
            uploadingImages={uploadingImages}
            validateFields={validateFields}
            allFieldsValid={allFieldsValid}
            hasFormData={hasFormData}
            resetForm={resetForm}
            handleImageUpload={handleImageUpload}
            addVariant={addVariant}
            removeVariant={removeVariant}
            updateVariant={updateVariant}
            addHighlight={addHighlight}
            removeHighlight={removeHighlight}
            updateHighlight={updateHighlight}
            addWhatsInsideItem={addWhatsInsideItem}
            removeWhatsInsideItem={removeWhatsInsideItem}
            updateWhatsInsideItem={updateWhatsInsideItem}
            addFaq={addFaq}
            removeFaq={removeFaq}
            updateFaq={updateFaq}
            handleProduct={isEditMode ? handleUpdateProduct : handleAddProduct}
            setIsAddDialogOpen={setIsAddDialogOpen}
            isEditMode={isEditMode}
            onClose={() => {
              setIsAddDialogOpen(false);
              if (isEditMode) {
                setIsEditMode(false);
                setSelectedProductForEdit(null);
                resetForm();
              }
            }}
          />
        </EcommerceHeader>

        <ProductStats
          totalProducts={totalProducts}
          activeProducts={activeProducts}
          totalOrders={totalOrders}
          totalRevenue={totalRevenue}
        />
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl">CityWitty Product Catalog</CardTitle>
            <CardDescription className="text-sm md:text-base">Manage all CityWitty products and inventory</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <ProductFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            <div className="overflow-x-auto">
              <ProductTable
                products={paginatedProducts}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                statusFilter={statusFilter}
                onViewProduct={handleViewProduct}
                onEditProduct={handleEditProduct}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </CardContent>
          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 mt-4 px-4 md:px-6 pb-4 md:pb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xs md:text-sm text-gray-700 whitespace-nowrap">Rows per page:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1); // Reset to first page
                  }}
                >
                  <SelectTrigger className="w-16 md:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="text-xs md:text-sm text-gray-700 text-center sm:text-left">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, filteredProducts.length)} of{" "}
                  {filteredProducts.length} entries
                </span>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs md:text-sm px-2 md:px-3"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs md:text-sm px-2 md:px-3"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

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

        <AlertDialog open={showMissingFieldsDialog} onOpenChange={setShowMissingFieldsDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Missing Required Fields</AlertDialogTitle>
              <AlertDialogDescription>
                Please fill in the following required fields before submitting:
                <ul className="mt-2 list-disc list-inside">
                  {missingFields.map((field, index) => (
                    <li key={index} className="text-red-500">{field}</li>
                  ))}
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowMissingFieldsDialog(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* <ProductViewModal
          product={selectedProductForView}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedProductForView(null);
          }}
        /> */}
      </div>
  );
}
