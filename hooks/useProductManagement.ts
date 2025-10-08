import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/app/types/ecommerce';

export const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        const mappedProducts: Product[] = data.products.map((p: any) => ({
          id: p.productId,
          name: p.productName,
          category: p.productCategory,
          price: p.originalPrice,
          discountPrice: p.discountedPrice || p.originalPrice,
          stock: parseInt(p.availableStocks) || 0,
          status: p.isAvailableStock ? "active" : "inactive",
          image: p.productImages[0] || "",
          description: p.productDescription,
          merchant: "Admin",
          sales: p.sales || 0,
          revenue: p.revenue || 0,
          productImages: p.productImages || [],
          brand: p.brand,
          productHighlights: p.productHighlights,
          productVariants: p.productVariants || [],
          offerApplicable: p.offerApplicable || "",
          deliveryFee: p.deliveryFee,
          orderHandlingFee: p.orderHandlingFee,
          discountOfferedOnProduct: p.discountOfferedOnProduct,
          productHeight: p.productHeight,
          productWidth: p.productWidth,
          productWeight: p.productWeight,
          productPackageWeight: p.productPackageWeight,
          productPackageHeight: p.productPackageHeight,
          productPackageWidth: p.productPackageWidth,
          whatsInsideTheBox: p.whatsInsideTheBox || [],
          isWarranty: p.isWarranty || false,
          warrantyDescription: p.warrantyDescription,
          rating: p.rating,
          deliverableLocations: p.deliverableLocations || [],
          eta: p.eta || "",
          faq: p.faq,
          instore: p.instore,
          cityWittyAssured: p.cityWittyAssured,
          isWalletCompatible: p.isWalletCompatible,
          cashbackPoints: p.cashbackPoints,
          isPriority: p.isPriority,
          sponsored: p.sponsored,
          bestsellerBadge: p.bestsellerBadge,
          additionalInfo: p.additionalInfo,
          isReplacement: p.isReplacement,
          replacementDays: p.replacementDays,
          isAvailableStock: p.isAvailableStock,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        setProducts(mappedProducts);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: product.status === "active" ? "inactive" : "active",
            }
          : product
      )
    );
    toast.success("Product status updated successfully");
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    toggleProductStatus,
    updateProduct,
  };
};
