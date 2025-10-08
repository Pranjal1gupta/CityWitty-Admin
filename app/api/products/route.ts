import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminProduct from '@/models/AdminProduct';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

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

    // Generate unique productId
    const productId = `PRD${Date.now().toString().slice(-6)}`;

    // Generate variantIds and ensure proper types
    const variantsWithIds = productVariants.map((variant: any, index: number) => ({
      variantId: `${productId}-V${(index + 1).toString().padStart(2, '0')}`,
      name: variant.name,
      price: parseFloat(variant.price) || 0,
      stock: parseInt(variant.stock) || 0,
      isAvailableStock: Boolean(variant.isAvailableStock)
    }));

    const newProduct = new AdminProduct({
      productId,
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
    });

    const savedProduct = await newProduct.save();

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      product: savedProduct
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding product:', error);

    // Provide more detailed error information
    let errorMessage = 'Failed to add product';
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

export async function GET() {
  try {
    await dbConnect();

    const products = await AdminProduct.aggregate([
      {
        $lookup: {
          from: "ecommerceorders",
          let: { productId: "$productId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$product.productId", "$$productId"] },
                    { $eq: ["$orderStatus", "delivered"] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$quantity" },
                totalRevenue: { $sum: "$orderAmount" }
              }
            }
          ],
          as: "salesData"
        }
      },
      {
        $addFields: {
          sales: { $ifNull: [{ $arrayElemAt: ["$salesData.totalSales", 0] }, 0] },
          revenue: { $ifNull: [{ $arrayElemAt: ["$salesData.totalRevenue", 0] }, 0] }
        }
      },
      { $project: { salesData: 0 } },
      { $sort: { createdAt: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products'
    }, { status: 500 });
  }
}
