// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import Partner from '@/models/Partners';
// import { Types } from 'mongoose';

// export async function GET() {
//   try {
//     await dbConnect();

//     const partners = await Partner.find({}).lean();

//     // Map partners to merchant data format
//     const merchants = partners.map((partner) => {
//       return {
//         _id: (partner._id as Types.ObjectId).toString(), // Use MongoDB _id
//         applicationId: partner.applicationId,
//         businessName: partner.businessName,
//         ownerName: partner.ownerName,
//         email: partner.email,
//         emailVerified: partner.emailVerified,
//         phone: partner.phone,
//         phoneVerified: partner.phoneVerified,
//         password: partner.password,
//         category: partner.category,
//         city: partner.city,
//         address: partner.address,
//         whatsapp: partner.whatsapp,
//         isWhatsappSame: partner.isWhatsappSame,
//         gstNumber: partner.gstNumber,
//         panNumber: partner.panNumber,
//         businessType: partner.businessType,
//         yearsInBusiness: partner.yearsInBusiness,
//         averageMonthlyRevenue: partner.averageMonthlyRevenue,
//         discountOffered: partner.discountOffered,
//         description: partner.description,
//         website: partner.website,
//         socialLinks: partner.socialLinks,
//         agreeToTerms: partner.agreeToTerms,
//         products: partner.products,
//         logo: partner.logo,
//         storeImages: partner.storeImages,
//         customOffer: partner.customOffer,
//         ribbonTag: partner.ribbonTag,
//         mapLocation: partner.mapLocation,
//         visibility: partner.visibility,
//         joinedSince: partner.joinedSince.toISOString(),
//         citywittyAssured: partner.citywittyAssured,
//         ratings: partner.ratings,
//         averageRating: partner.averageRating,
//         tags: partner.tags,
//         status: partner.status,
//         deactivationReason: partner.deactivationReason,
//         otpCode: partner.otpCode,
//         otpExpiry: partner.otpExpiry?.toISOString(),
//         createdAt: partner.createdAt.toISOString(),
//         updatedAt: partner.updatedAt.toISOString(),
//       };
//     });

//     // Calculate stats
//     const totalMerchants = partners.length;
//     const activeMerchants = partners.filter(p => p.status === 'active').length;
//     const pendingApprovals = partners.filter(p => p.status === 'pending').length;
//     const suspendedMerchants = partners.filter(p => p.status === 'suspended').length;

//     const stats = {
//       totalMerchants,
//       activeMerchants,
//       pendingApprovals,
//       suspendedMerchants,
//     };

//     return NextResponse.json({ merchants, stats });
//   } catch (error) {
//     console.error('Error fetching merchants:', error);
//     return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partners';
import { Types } from 'mongoose';

// Disable ISR / caching
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const partners = await Partner.find({}).lean();

    // Map partners to merchant data format
    const merchants = partners.map((partner) => ({
      _id: (partner._id as Types.ObjectId).toString(),
      applicationId: partner.applicationId,
      businessName: partner.businessName,
      ownerName: partner.ownerName,
      email: partner.email,
      emailVerified: partner.emailVerified,
      phone: partner.phone,
      phoneVerified: partner.phoneVerified,
      password: partner.password,
      category: partner.category,
      city: partner.city,
      address: partner.address,
      whatsapp: partner.whatsapp,
      isWhatsappSame: partner.isWhatsappSame,
      gstNumber: partner.gstNumber,
      panNumber: partner.panNumber,
      businessType: partner.businessType,
      yearsInBusiness: partner.yearsInBusiness,
      averageMonthlyRevenue: partner.averageMonthlyRevenue,
      discountOffered: partner.discountOffered,
      description: partner.description,
      website: partner.website,
      socialLinks: partner.socialLinks,
      agreeToTerms: partner.agreeToTerms,
      products: partner.products,
      logo: partner.logo,
      storeImages: partner.storeImages,
      customOffer: partner.customOffer,
      ribbonTag: partner.ribbonTag,
      mapLocation: partner.mapLocation,
      visibility: partner.visibility,
      joinedSince: partner.joinedSince.toISOString(),
      citywittyAssured: partner.citywittyAssured,
      ratings: partner.ratings,
      averageRating: partner.averageRating,
      tags: partner.tags,
      status: partner.status,
      deactivationReason: partner.deactivationReason,
      otpCode: partner.otpCode,
      otpExpiry: partner.otpExpiry?.toISOString(),
      createdAt: partner.createdAt.toISOString(),
      updatedAt: partner.updatedAt.toISOString(),
    }));

    // Calculate stats
    const stats = {
      totalMerchants: partners.length,
      activeMerchants: partners.filter(p => p.status === 'active').length,
      pendingApprovals: partners.filter(p => p.status === 'pending').length,
      suspendedMerchants: partners.filter(p => p.status === 'suspended').length,
    };

    // Send response with no caching headers
    return NextResponse.json(
      { merchants, stats },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

