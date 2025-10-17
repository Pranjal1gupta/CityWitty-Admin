import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/partner/partner.schema';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { purchasedPackage } = body;

    // Validate that purchasedPackage object exists
    if (!purchasedPackage) {
      return NextResponse.json(
        { error: 'Purchased package data is required' },
        { status: 400 }
      );
    }

    const { variantName, purchaseDate, expiryDate, transactionId } = purchasedPackage;

    // Validate that at least one field is provided
    if (!variantName && !purchaseDate && !expiryDate && !transactionId) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      );
    }

    // Build the update object with nested field notation
    const updateData: any = {};

    if (variantName !== undefined) updateData['purchasedPackage.variantName'] = variantName;
    if (purchaseDate !== undefined) updateData['purchasedPackage.purchaseDate'] = purchaseDate ? new Date(purchaseDate) : null;
    if (expiryDate !== undefined) updateData['purchasedPackage.expiryDate'] = expiryDate ? new Date(expiryDate) : null;
    if (transactionId !== undefined) updateData['purchasedPackage.transactionId'] = transactionId;

    const updatedPartner = await Partner.findOneAndUpdate(
      { $or: [{ _id: id }, { merchantId: id }] },
      updateData,
      { new: true }
    ).lean();

    if (!updatedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPartner, { status: 200 });
  } catch (error) {
    console.error('Error updating purchased package:', error);
    return NextResponse.json(
      { error: 'Failed to update purchased package' },
      { status: 500 }
    );
  }
}