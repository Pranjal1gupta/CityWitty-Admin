import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Types } from 'mongoose';
import Partner from '@/models/partner/partner.schema';

// Disable ISR / caching
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const partners = await Partner.find({}).lean();

    // Map partners to merchant data format
    const merchants = partners.map((partner) => ({
      _id: (partner._id as Types.ObjectId).toString(),
      merchantId: partner.merchantId,
      legalName: partner.legalName,
      displayName: partner.displayName,
      email: partner.email,
      emailVerified: partner.emailVerified,
      phone: partner.phone,
      phoneVerified: partner.phoneVerified,
      password: partner.password,
      category: partner.category,
      city: partner.city,
      streetAddress: partner.streetAddress,
      pincode: partner.pincode,
      locality: partner.locality,
      state: partner.state,
      country: partner.country,
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
      purchasedPackage: partner.purchasedPackage,
      renewal: partner.renewal,
      onboardingAgent: partner.onboardingAgent,
      otpCode: partner.otpCode,
      otpExpiry: partner.otpExpiry?.toISOString(),
      paymentMethodAccepted: partner.paymentMethodAccepted,
      qrcodeLink: partner.qrcodeLink,
      businessHours: partner.businessHours,
      bankDetails: partner.bankDetails,
      ListingLimit: partner.ListingLimit,
      Addedlistings: partner.Addedlistings,
      totalGraphics: partner.totalGraphics,
      totalReels: partner.totalReels,
      isWebsite: partner.isWebsite,
      totalEarnings: partner.totalEarnings,
      ds_graphics: partner.ds_graphics,
      ds_reel: partner.ds_reel,
      ds_weblog: partner.ds_weblog,
      totalPodcast: partner.totalPodcast,
      completedPodcast: partner.completedPodcast,
      podcastLog: partner.podcastLog,
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

