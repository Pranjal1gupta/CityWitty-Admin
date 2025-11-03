import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/partner/partner.schema';

interface DigitalSupportAsset {
  ds_graphics?: Array<{
    graphicId: string;
    requestDate: string;
    completionDate?: string;
    status: 'completed' | 'pending';
    requestCategory: string;
    content: string;
    subject: string;
    isSchedules?: boolean;
  }>;
  ds_reel?: Array<{
    reelId: string;
    requestDate: string;
    completionDate?: string;
    status: 'completed' | 'pending';
    content: string;
    subject: string;
  }>;
  ds_weblog?: Array<{
    weblog_id: string;
    status: 'completed' | 'pending';
    completionDate?: string;
    description: string;
  }>;
  podcastLog?: Array<{
    title: string;
    scheduleDate: string;
    completeDate?: string;
    status: 'scheduled' | 'completed' | 'pending';
  }>;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { digitalSupportData } = body as { digitalSupportData: DigitalSupportAsset };

    // Validate that digitalSupportData exists
    if (!digitalSupportData) {
      return NextResponse.json(
        { error: 'Digital support data is required' },
        { status: 400 }
      );
    }

    // Helper function to convert string dates to Date objects and validate
    const convertToDate = (dateString: string | undefined): Date | undefined => {
      if (!dateString) return undefined;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return undefined;
      return date;
    };

    // Build the update object using $set to REPLACE entire arrays
    const updateData: any = { $set: {} };

    // Process graphics
    if (digitalSupportData.ds_graphics !== undefined) {
      if (digitalSupportData.ds_graphics && digitalSupportData.ds_graphics.length > 0) {
        const graphicsWithDates = digitalSupportData.ds_graphics.map((graphic) => ({
          ...graphic,
          requestDate: convertToDate(graphic.requestDate) || new Date(),
          completionDate: convertToDate(graphic.completionDate),
        }));
        updateData['$set'].ds_graphics = graphicsWithDates;
      } else {
        // Empty array - clear the field
        updateData['$set'].ds_graphics = [];
      }
    }

    // Process reels
    if (digitalSupportData.ds_reel !== undefined) {
      if (digitalSupportData.ds_reel && digitalSupportData.ds_reel.length > 0) {
        const reelsWithDates = digitalSupportData.ds_reel.map((reel) => ({
          ...reel,
          requestDate: convertToDate(reel.requestDate) || new Date(),
          completionDate: convertToDate(reel.completionDate),
        }));
        updateData['$set'].ds_reel = reelsWithDates;
      } else {
        // Empty array - clear the field
        updateData['$set'].ds_reel = [];
      }
    }

    // Process weblogs
    if (digitalSupportData.ds_weblog !== undefined) {
      if (digitalSupportData.ds_weblog && digitalSupportData.ds_weblog.length > 0) {
        const weblogsWithDates = digitalSupportData.ds_weblog.map((weblog) => ({
          ...weblog,
          completionDate: convertToDate(weblog.completionDate),
        }));
        updateData['$set'].ds_weblog = weblogsWithDates;
      } else {
        // Empty array - clear the field
        updateData['$set'].ds_weblog = [];
      }
    }

    // Process podcasts
    if (digitalSupportData.podcastLog !== undefined) {
      if (digitalSupportData.podcastLog && digitalSupportData.podcastLog.length > 0) {
        const podcastsWithDates = digitalSupportData.podcastLog.map((podcast) => ({
          ...podcast,
          scheduleDate: convertToDate(podcast.scheduleDate),
          completeDate: convertToDate(podcast.completeDate),
        }));
        updateData['$set'].podcastLog = podcastsWithDates;
      } else {
        // Empty array - clear the field
        updateData['$set'].podcastLog = [];
      }
    }

    // Check if we have any updates
    if (Object.keys(updateData['$set']).length === 0) {
      return NextResponse.json(
        { error: 'No valid digital support data provided' },
        { status: 400 }
      );
    }

    const updatedPartner = await Partner.findOneAndUpdate(
      { $or: [{ _id: id }, { merchantId: id }] },
      updateData,
      { new: true }
    ).lean();

    if (!updatedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Digital support assets updated successfully',
        data: updatedPartner,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating digital support assets:', error);
    return NextResponse.json(
      { error: 'Failed to update digital support assets' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve digital support assets
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    const partner = await Partner.findOne(
      { $or: [{ _id: id }, { merchantId: id }] }
    ).lean() as any;

    if (!partner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const digitalSupportData = {
      ds_graphics: partner?.ds_graphics || [],
      ds_reel: partner?.ds_reel || [],
      ds_weblog: partner?.ds_weblog || [],
      podcastLog: partner?.podcastLog || [],
    };

    return NextResponse.json(digitalSupportData, { status: 200 });
  } catch (error) {
    console.error('Error retrieving digital support assets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve digital support assets' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove specific digital support assets
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { type, itemId } = body as { type: 'graphic' | 'reel' | 'weblog' | 'podcast'; itemId: string };

    if (!type || !itemId) {
      return NextResponse.json(
        { error: 'Type and itemId are required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    // Remove the item from the appropriate array based on type
    switch (type) {
      case 'graphic':
        updateData['$pull'] = { ds_graphics: { graphicId: itemId } };
        break;
      case 'reel':
        updateData['$pull'] = { ds_reel: { reelId: itemId } };
        break;
      case 'weblog':
        updateData['$pull'] = { ds_weblog: { weblog_id: itemId } };
        break;
      case 'podcast':
        updateData['$pull'] = { podcastLog: { title: itemId } };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid asset type' },
          { status: 400 }
        );
    }

    const updatedPartner = await Partner.findOneAndUpdate(
      { $or: [{ _id: id }, { merchantId: id }] },
      updateData,
      { new: true }
    ).lean();

    if (!updatedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `${type} removed successfully`,
        data: updatedPartner,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing digital support asset:', error);
    return NextResponse.json(
      { error: 'Failed to remove digital support asset' },
      { status: 500 }
    );
  }
}