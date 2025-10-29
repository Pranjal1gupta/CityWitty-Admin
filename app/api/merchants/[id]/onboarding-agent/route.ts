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
    const { onboardingAgent } = body;

    // Validate that onboardingAgent object exists
    if (!onboardingAgent) {
      return NextResponse.json(
        { error: 'Onboarding agent data is required' },
        { status: 400 }
      );
    }

    const { agentId, agentName } = onboardingAgent;

    // Validate that at least one field is provided
    if (!agentId && !agentName) {
      return NextResponse.json(
        { error: 'At least one field (agentId or agentName) must be provided' },
        { status: 400 }
      );
    }

    // Build the update object with nested field notation
    const updateData: any = {};

    if (agentId !== undefined) updateData['onboardingAgent.agentId'] = agentId;
    if (agentName !== undefined) updateData['onboardingAgent.agentName'] = agentName;

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
    console.error('Error updating onboarding agent:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding agent' },
      { status: 500 }
    );
  }
}