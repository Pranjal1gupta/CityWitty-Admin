import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminProduct from '@/models/AdminProduct';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const {
      productName,
      productImages,
      productDescription,
      productCategory,
      brand,
      productHighlights,
      productVariants,
      originalPrice,
      discountedPrice,
      offerApplicable,
      deliveryFee,
      orderHandlingFee,
      discountOfferedOnProduct,
      productHeight,
      productWidth,
      productWeight,
      productPackageWeight,
      productPackageHeight,
      productPackageWidth,
      whatsInsideTheBox,
      isWarranty,
      warrantyDescription,
      deliverableLocations,
      eta,
      instore,
      cityWittyAssured,
      isWalletCompatible,
      cashbackPoints,
      isPriority,
      sponsored,
      bestsellerBadge,
      additionalInfo,
      isReplacement,
      replacementDays,
      isAvailableStock,
      availableStocks,
      faq
    } = body;

    // Find the existing product by productId
    const existingProduct = await AdminProduct.findOne({ productId: id });
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    // Update variantIds if variants are provided, or keep existing
    let variantsWithIds = existingProduct.productVariants;
    if (productVariants && productVariants.length > 0) {
      variantsWithIds = productVariants.map((variant: any, index: number) => ({
        variantId: variant.variantId || `${existingProduct.productId}-V${(index + 1).toString().padStart(2, '0')}`,
        name: variant.name,
        price: parseFloat(variant.price) || 0,
        stock: parseInt(variant.stock) || 0,
        isAvailableStock: Boolean(variant.isAvailableStock)
      }));
    }

    // Update the product
    const updatedProduct = await AdminProduct.findOneAndUpdate(
      { productId: id },
      {
        productName,
        productImages: productImages || [],
        productDescription,
        productCategory,
        brand: brand || undefined,
        productHighlights: productHighlights || [],
        productVariants: variantsWithIds,
        originalPrice: parseFloat(originalPrice) || 0,
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) || 0 : undefined,
        offerApplicable: offerApplicable || '',
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) || 0 : 0,
        orderHandlingFee: orderHandlingFee ? parseFloat(orderHandlingFee) || 0 : 0,
        discountOfferedOnProduct: discountOfferedOnProduct ? parseFloat(discountOfferedOnProduct) || 0 : 0,
        productHeight: parseFloat(productHeight) || 0,
        productWidth: parseFloat(productWidth) || 0,
        productWeight: parseFloat(productWeight) || 0,
        productPackageWeight: parseFloat(productPackageWeight) || 0,
        productPackageHeight: parseFloat(productPackageHeight) || 0,
        productPackageWidth: parseFloat(productPackageWidth) || 0,
        whatsInsideTheBox,
        isWarranty: Boolean(isWarranty),
        warrantyDescription: warrantyDescription || undefined,
        deliverableLocations,
        eta,
        instore: Boolean(instore),
        cityWittyAssured: Boolean(cityWittyAssured),
        isWalletCompatible: Boolean(isWalletCompatible),
        cashbackPoints: cashbackPoints ? parseInt(cashbackPoints) || 0 : 0,
        isPriority: Boolean(isPriority),
        sponsored: Boolean(sponsored),
        bestsellerBadge: Boolean(bestsellerBadge),
        additionalInfo: additionalInfo || undefined,
        isReplacement: Boolean(isReplacement),
        replacementDays: replacementDays ? parseInt(replacementDays) || 0 : 0,
        isAvailableStock: Boolean(isAvailableStock),
        availableStocks: availableStocks ? parseInt(availableStocks) || 0 : 0,
        faq: faq || []
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);

    // Provide more detailed error information
    let errorMessage = 'Failed to update product';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'errors' in error) {
      // Mongoose validation errors
      const validationErrors = error as any;
      errorMessage = Object.values(validationErrors.errors).map((err: any) => err.message).join(', ');
    }

    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
