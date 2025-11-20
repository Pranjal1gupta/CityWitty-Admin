import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary environment variables not configured');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { avatarUrl, userId } = body;

    console.log('Avatar removal request:', { avatarUrl, userId });

    if (!avatarUrl || !userId) {
      return NextResponse.json(
        { success: false, error: 'Avatar URL and User ID are required' },
        { status: 400 }
      );
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid User ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the admin user
    const admin = await Admin.findById(userId);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Extract public ID from Cloudinary URL
    // Cloudinary URLs typically look like: https://res.cloudinary.com/{cloud_name}/image/upload/[v{version}/]{public_id}.{format}
    const uploadIndex = avatarUrl.indexOf('/upload/');
    if (uploadIndex !== -1) {
      let afterUpload = avatarUrl.substring(uploadIndex + 8); // Skip '/upload/'
      // Skip version if present (starts with 'v' followed by digits)
      if (afterUpload.startsWith('v') && afterUpload.length > 1 && /^\d/.test(afterUpload[1])) {
        const versionEnd = afterUpload.indexOf('/');
        if (versionEnd !== -1) {
          afterUpload = afterUpload.substring(versionEnd + 1);
        }
      }
      // Remove file extension
      const dotIndex = afterUpload.lastIndexOf('.');
      const publicId = dotIndex !== -1 ? afterUpload.substring(0, dotIndex) : afterUpload;

      console.log('Extracted publicId:', publicId);

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary deletion successful');
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with database update even if Cloudinary deletion fails
      }
    } else {
      console.warn('Avatar URL does not appear to be a Cloudinary URL:', avatarUrl);
      // Continue with database update
    }

    // Update database - remove avatar URL
    const updateResult = await Admin.findByIdAndUpdate(userId, { avatar: '' });
    console.log('Database update result:', !!updateResult);

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    });

  } catch (error) {
    console.error('Avatar removal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}