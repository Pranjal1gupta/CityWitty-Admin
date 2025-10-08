import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface FieldErrors {
  productName: string;
  productDescription: string;
  productCategory: string;
  originalPrice: string;
  discountedPrice: string;
  availableStocks: string;
  productHeight: string;
  productWidth: string;
  productWeight: string;
  productPackageWeight: string;
  productPackageWidth: string;
  productPackageHeight: string;
  whatsInsideTheBox: string;
  deliverableLocations: string;
  eta: string;
  warrantyDescription: string;
  replacementDays: string;
  productImages: string;
  variantStockSum: string;
}

const initialFieldErrors: FieldErrors = {
  productName: '',
  productDescription: '',
  productCategory: '',
  originalPrice: '',
  discountedPrice: '',
  availableStocks: '',
  productHeight: '',
  productWidth: '',
  productWeight: '',
  productPackageWeight: '',
  productPackageWidth: '',
  productPackageHeight: '',
  whatsInsideTheBox: '',
  deliverableLocations: '',
  eta: '',
  warrantyDescription: '',
  replacementDays: '',
  productImages: '',
  variantStockSum: ''
};

const initialAddForm = {
  productId: "",
  productName: "",
  productImages: [] as string[],
  productDescription: "",
  productCategory: "",
  brand: "",
  productHighlights: [""] as string[],
  productVariants: [
    {
      variantId: "",
      name: "",
      price: "",
      stock: "",
      isAvailableStock: false,
    },
  ] as any[],
  originalPrice: "",
  discountedPrice: "",
  offerApplicable: "",
  deliveryFee: "10",
  orderHandlingFee: "10",
  discountOfferedOnProduct: "",
  productHeight: "",
  productWidth: "",
  productWeight: "",
  productPackageWeight: "",
  productPackageHeight: "",
  productPackageWidth: "",
  whatsInsideTheBox: [""] as string[],
  isWarranty: false,
  warrantyDescription: "",
  rating: [] as any[],
  deliverableLocations: [] as string[],
  eta: "",
  faq: [
    {
      question: "",
      answer: "",
      certifiedBuyer: false,
      isLike: false,
    },
  ] as any[],
  instore: false,
  cityWittyAssured: false,
  isWalletCompatible: false,
  cashbackPoints: "",
  isPriority: false,
  sponsored: false,
  bestsellerBadge: false,
  additionalInfo: "",
  isReplacement: false,
  replacementDays: "",
  isAvailableStock: false,
  availableStocks: "",
};

export const useAddProductForm = () => {
  const [addForm, setAddForm] = useState(initialAddForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(initialFieldErrors);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Validate mandatory fields
  const validateFields = useCallback(() => {
    // Calculate sum of variant stocks
    const totalVariantStock = addForm.productVariants.reduce((sum, variant) => {
      const stockNum = parseInt(variant.stock);
      return sum + (isNaN(stockNum) ? 0 : stockNum);
    }, 0);

    const originalPriceNum = parseFloat(addForm.originalPrice);
    const discountedPriceNum = parseFloat(addForm.discountedPrice);
    const discountPercentageNum = parseFloat(addForm.discountOfferedOnProduct);

    let updatedForm = { ...addForm };
    let hasFormChanges = false;

    // Auto calculate based on available values
    if (!isNaN(originalPriceNum) && originalPriceNum > 0) {
      if (!isNaN(discountPercentageNum) && discountPercentageNum >= 0 && discountPercentageNum <= 100) {
        // Calculate discounted price from original price and discount percentage
        const calculatedDiscountedPrice = originalPriceNum - (originalPriceNum * discountPercentageNum / 100);
        const currentDiscountedPrice = parseFloat(addForm.discountedPrice);
        if (Math.abs(calculatedDiscountedPrice - currentDiscountedPrice) > 0.01 || isNaN(currentDiscountedPrice)) {
          updatedForm.discountedPrice = calculatedDiscountedPrice.toFixed(2);
          hasFormChanges = true;
        }
      } else if (!isNaN(discountedPriceNum) && discountedPriceNum >= 0 && discountedPriceNum < originalPriceNum) {
        // Calculate discount percentage from original price and discounted price
        const calculatedDiscountPercentage = ((originalPriceNum - discountedPriceNum) / originalPriceNum) * 100;
        const currentDiscountPercentage = parseFloat(addForm.discountOfferedOnProduct);
        if (Math.abs(calculatedDiscountPercentage - currentDiscountPercentage) > 0.01 || isNaN(currentDiscountPercentage)) {
          updatedForm.discountOfferedOnProduct = calculatedDiscountPercentage.toFixed(2);
          hasFormChanges = true;
        }
      }
    }

    const errors = {
      productName: (addForm.productName && typeof addForm.productName === 'string' && addForm.productName.trim()) ? '' : 'Product name is required',
      productDescription: (addForm.productDescription && typeof addForm.productDescription === 'string' && addForm.productDescription.trim()) ? '' : 'Product description is required',
      productCategory: addForm.productCategory ? '' : 'Product category is required',
      originalPrice: (addForm.originalPrice && !isNaN(originalPriceNum) && originalPriceNum > 0) ? '' : 'Valid original price greater than 0 is required',
      discountedPrice: (updatedForm.discountedPrice && !isNaN(parseFloat(updatedForm.discountedPrice)) && parseFloat(updatedForm.discountedPrice) >= 0 && parseFloat(updatedForm.discountedPrice) < originalPriceNum) ? '' : (updatedForm.discountedPrice ? 'Discounted price must be less than original price' : ''),
      availableStocks: (addForm.availableStocks && !isNaN(parseInt(addForm.availableStocks)) && parseInt(addForm.availableStocks) >= 0) ? '' : 'Valid available stocks (0 or greater) is required',
      productHeight: (addForm.productHeight && !isNaN(parseFloat(addForm.productHeight)) && parseFloat(addForm.productHeight) > 0) ? '' : 'Valid product height greater than 0 is required',
      productWidth: (addForm.productWidth && !isNaN(parseFloat(addForm.productWidth)) && parseFloat(addForm.productWidth) > 0) ? '' : 'Valid product width greater than 0 is required',
      productWeight: (addForm.productWeight && !isNaN(parseFloat(addForm.productWeight)) && parseFloat(addForm.productWeight) > 0) ? '' : 'Valid product weight greater than 0 is required',
      productPackageWeight: (addForm.productPackageWeight && !isNaN(parseFloat(addForm.productPackageWeight)) && parseFloat(addForm.productPackageWeight) > 0) ? '' : 'Valid package weight greater than 0 is required',
      productPackageWidth: (addForm.productPackageWidth && !isNaN(parseFloat(addForm.productPackageWidth)) && parseFloat(addForm.productPackageWidth) > 0) ? '' : 'Valid package width greater than 0 is required',
      productPackageHeight: (addForm.productPackageHeight && !isNaN(parseFloat(addForm.productPackageHeight)) && parseFloat(addForm.productPackageHeight) > 0) ? '' : 'Valid package height greater than 0 is required',
      whatsInsideTheBox: addForm.whatsInsideTheBox.some(item => item && typeof item === 'string' && item.trim()) ? '' : 'At least one item in "What\'s Inside the Box" is required',
      deliverableLocations: addForm.deliverableLocations.length > 0 ? '' : 'At least one deliverable location is required',
      eta: (addForm.eta && typeof addForm.eta === 'string' && addForm.eta.trim()) ? '' : 'ETA is required',
      warrantyDescription: addForm.isWarranty && (!addForm.warrantyDescription || typeof addForm.warrantyDescription !== 'string' || !addForm.warrantyDescription.trim()) ? 'Warranty description is required when warranty is enabled' : '',
      replacementDays: addForm.isReplacement && (!addForm.replacementDays || isNaN(parseInt(addForm.replacementDays)) || parseInt(addForm.replacementDays) <= 0) ? 'Valid replacement days greater than 0 is required when replacement is enabled' : '',
      productImages: addForm.productImages.length <= 5 ? '' : 'Maximum 5 product images allowed',
      variantStockSum: totalVariantStock <= parseInt(addForm.availableStocks || "0") ? '' : 'Sum of variant stocks must be less than or equal to total available stocks'
    };

    // Only update state if errors changed to prevent re-render loop
    const hasErrorChanges = Object.keys(errors).some(key => errors[key as keyof typeof errors] !== fieldErrors[key as keyof typeof fieldErrors]);

    if (hasErrorChanges) {
      setFieldErrors(errors);
    }

    // Only update form state if there are actual changes to prevent infinite loops
    if (hasFormChanges) {
      setAddForm(updatedForm);
    }

    return Object.values(errors).every(error => error === '');
  }, [addForm, fieldErrors]);

  // Check if all mandatory fields are valid
  const allFieldsValid = () => {
    return validateFields();
  };

  // Check if add form has any data
  const hasFormData = (): boolean => {
    return Boolean(
      addForm.productName.trim() ||
      addForm.productDescription.trim() ||
      addForm.productCategory ||
      addForm.brand.trim() ||
      addForm.productHighlights.some(h => h.trim()) ||
      addForm.productVariants.some(v => v.name.trim() || v.price || v.stock) ||
      addForm.originalPrice ||
      addForm.discountedPrice ||
      addForm.offerApplicable.trim() ||
      addForm.deliveryFee ||
      addForm.orderHandlingFee ||
      addForm.discountOfferedOnProduct ||
      addForm.productHeight ||
      addForm.productWidth ||
      addForm.productWeight ||
      addForm.productPackageWeight ||
      addForm.productPackageHeight ||
      addForm.productPackageWidth ||
      addForm.whatsInsideTheBox.some(item => item.trim()) ||
      addForm.isWarranty ||
      addForm.warrantyDescription.trim() ||
      addForm.deliverableLocations.length > 0 ||
      addForm.eta.trim() ||
      addForm.faq.some(faq => faq.question.trim() || faq.answer.trim()) ||
      addForm.instore ||
      addForm.cityWittyAssured ||
      addForm.isWalletCompatible ||
      addForm.cashbackPoints ||
      addForm.isPriority ||
      addForm.sponsored ||
      addForm.bestsellerBadge ||
      addForm.additionalInfo.trim() ||
      addForm.isReplacement ||
      addForm.replacementDays ||
      addForm.availableStocks ||
      addForm.productImages.length > 0
    );
  };

  // Reset form
  const resetForm = () => {
    setAddForm(initialAddForm);
    setFieldErrors(initialFieldErrors);
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(
            "Failed to upload image: " + file.name
          );
        }
      } catch (error) {
        toast.error(
          "Failed to upload image: " + file.name
        );
      }
    }
    setAddForm({
      ...addForm,
      productImages: [
        ...addForm.productImages,
        ...uploadedUrls,
      ],
    });
    setUploadingImages(false);
  };

  // Add/Remove/Update helpers
  const addVariant = () => {
    setAddForm((prev) => ({
      ...prev,
      productVariants: [
        ...prev.productVariants,
        {
          variantId: "",
          name: "",
          price: "",
          stock: "",
          isAvailableStock: false,
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if (addForm.productVariants.length > 1) {
      setAddForm((prev) => ({
        ...prev,
        productVariants: prev.productVariants.filter((_, i) => i !== index),
      }));
    }
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setAddForm((prev) => ({
      ...prev,
      productVariants: prev.productVariants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const addHighlight = () => {
    setAddForm((prev) => ({
      ...prev,
      productHighlights: [...prev.productHighlights, ""],
    }));
  };

  const removeHighlight = (index: number) => {
    if (addForm.productHighlights.length > 1) {
      setAddForm((prev) => ({
        ...prev,
        productHighlights: prev.productHighlights.filter((_, i) => i !== index),
      }));
    }
  };

  const updateHighlight = (index: number, value: string) => {
    setAddForm((prev) => ({
      ...prev,
      productHighlights: prev.productHighlights.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addWhatsInsideItem = () => {
    setAddForm((prev) => ({
      ...prev,
      whatsInsideTheBox: [...prev.whatsInsideTheBox, ""],
    }));
  };

  const removeWhatsInsideItem = (index: number) => {
    if (addForm.whatsInsideTheBox.length > 1) {
      setAddForm((prev) => ({
        ...prev,
        whatsInsideTheBox: prev.whatsInsideTheBox.filter((_, i) => i !== index),
      }));
    }
  };

  const updateWhatsInsideItem = (index: number, value: string) => {
    setAddForm((prev) => ({
      ...prev,
      whatsInsideTheBox: prev.whatsInsideTheBox.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addFaq = () => {
    setAddForm((prev) => ({
      ...prev,
      faq: [
        ...prev.faq,
        {
          question: "",
          answer: "",
          certifiedBuyer: true,
          isLike: false,
        },
      ],
    }));
  };

  const removeFaq = (index: number) => {
    setAddForm((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  };

  const updateFaq = (index: number, field: string, value: any) => {
    setAddForm((prev) => ({
      ...prev,
      faq: prev.faq.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      ),
    }));
  };

  // Prepare productVariants for saving: if variant data is empty, set productVariants to empty array
  const getValidProductVariants = () => {
    if (!addForm.productVariants || addForm.productVariants.length === 0) {
      return [];
    }
    // Check if all variants have empty name, price, and stock
    const allEmpty = addForm.productVariants.every(variant =>
      (!variant.name || variant.name.trim() === '') &&
      (!variant.price || variant.price === '') &&
      (!variant.stock || variant.stock === '')
    );
    if (allEmpty) {
      return [];
    }
    return addForm.productVariants;
  };

  // Prepare productHighlights for saving: if highlight data is empty, set productHighlights to empty array
  const getValidProductHighlights = () => {
    if (!addForm.productHighlights || addForm.productHighlights.length === 0) {
      return [];
    }
    // Check if all highlights are empty
    const allEmpty = addForm.productHighlights.every(highlight =>
      !highlight || highlight.trim() === ''
    );
    if (allEmpty) {
      return [];
    }
    return addForm.productHighlights;
  };

  // Prepare faq for saving: if faq data is empty, set faq to empty array
  const getValidFaq = () => {
    if (!addForm.faq || addForm.faq.length === 0) {
      return [];
    }
    // Check if all faq items have empty question and answer
    const allEmpty = addForm.faq.every(faqItem =>
      (!faqItem.question || faqItem.question.trim() === '') &&
      (!faqItem.answer || faqItem.answer.trim() === '')
    );
    if (allEmpty) {
      return [];
    }
    return addForm.faq;
  };

  return {
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
  };
};
