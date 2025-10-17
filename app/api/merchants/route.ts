import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Types } from 'mongoose';
import Partner from '@/models/partner/partner.schema';

// Disable ISR / caching
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Build base query for search (used for stats)
    let baseQuery: any = {};
    if (search) {
      baseQuery.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Build query for pagination (includes status filter)
    let query: any = { ...baseQuery };
    if (status !== 'all') {
      query.status = status;
    }

    const totalCount = await Partner.countDocuments(query);
    const partners = await Partner.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

    // Map partners to merchant data format
    const merchants = partners.map((partner) => ({
      _id: (partner._id as Types.ObjectId).toString(),
      merchantId: partner.merchantId,
      username: partner.username,
      legalName: partner.legalName,
      displayName: partner.displayName,
      merchantSlug: partner.merchantSlug,
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
      products: partner.products ? partner.products.map((p: any) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
        rating: p.rating ? p.rating.map((r: any) => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        })) : null,
      })) : null,
      logo: partner.logo,
      storeImages: partner.storeImages,
      customOffer: partner.customOffer,
      ribbonTag: partner.ribbonTag,
      mapLocation: partner.mapLocation,
      visibility: partner.visibility,
      joinedSince: partner.joinedSince ? partner.joinedSince.toISOString() : null,
      citywittyAssured: partner.citywittyAssured,
      isVerified: partner.isVerified,
      isCWassured: partner.isCWassured,
      isPremiumSeller: partner.isPremiumSeller,
      isTopMerchant: partner.isTopMerchant,
      ratings: partner.ratings ? partner.ratings.map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })) : null,
      averageRating: partner.averageRating,
      tags: partner.tags,
      status: partner.status,
      suspensionReason: partner.suspensionReason,

      purchasedPackage: partner.purchasedPackage ? {
        variantName: partner.purchasedPackage.variantName,
        purchaseDate: partner.purchasedPackage.purchaseDate ? partner.purchasedPackage.purchaseDate.toISOString() : null,
        expiryDate: partner.purchasedPackage.expiryDate ? partner.purchasedPackage.expiryDate.toISOString() : null,
        transactionId: partner.purchasedPackage.transactionId,
      } : null,
      renewal: partner.renewal ? {
        isRenewed: partner.renewal.isRenewed,
        renewalDate: partner.renewal.renewalDate ? partner.renewal.renewalDate.toISOString() : null,
        renewalExpiry: partner.renewal.renewalExpiry ? partner.renewal.renewalExpiry.toISOString() : null,
      } : null,
      onboardingAgent: partner.onboardingAgent,
      otpCode: partner.otpCode,
      otpExpiry: partner.otpExpiry ? partner.otpExpiry.toISOString() : null,
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
      minimumOrderValue: partner.minimumOrderValue,
      offlineDiscount: partner.offlineDiscount ? partner.offlineDiscount.map((d: any) => ({
        category: d.category,
        offerTitle: d.offerTitle,
        offerDescription: d.offerDescription,
        discountValue: d.discountValue,
        discountPercent: d.discountPercent,
        status: d.status,
        validUpto: d.validUpto ? d.validUpto.toISOString() : null,
      })) : null,
      branchLocations: partner.branchLocations,
      ds_graphics: partner.ds_graphics ? partner.ds_graphics.map((g: any) => ({
        graphicId: g.graphicId,
        requestDate: g.requestDate ? g.requestDate.toISOString() : null,
        completionDate: g.completionDate ? g.completionDate.toISOString() : null,
        status: g.status,
        requestCategory: g.requestCategory,
        content: g.content,
        subject: g.subject,
        isSchedules: g.isSchedules,
      })) : null,
      ds_reel: partner.ds_reel ? partner.ds_reel.map((r: any) => ({
        reelId: r.reelId,
        requestDate: r.requestDate ? r.requestDate.toISOString() : null,
        completionDate: r.completionDate ? r.completionDate.toISOString() : null,
        status: r.status,
        content: r.content,
        subject: r.subject,
      })) : null,
      ds_weblog: partner.ds_weblog ? partner.ds_weblog.map((w: any) => ({
        weblog_id: w.weblog_id,
        status: w.status,
        completionDate: w.completionDate ? w.completionDate.toISOString() : null,
        description: w.description,
      })) : null,
      totalPodcast: partner.totalPodcast,
      completedPodcast: partner.completedPodcast,
      podcastLog: partner.podcastLog ? partner.podcastLog.map((p: any) => ({
        title: p.title,
        status: p.status,
        scheduleDate: p.scheduleDate ? p.scheduleDate.toISOString() : null,
        completeDate: p.completeDate ? p.completeDate.toISOString() : null,
      })) : null,
      createdAt: partner.createdAt ? partner.createdAt.toISOString() : null,
      updatedAt: partner.updatedAt ? partner.updatedAt.toISOString() : null,
    }));

    // Calculate stats from all data (without any filters or pagination)
    const stats = {
      totalMerchants: await Partner.countDocuments({}),
      activeMerchants: await Partner.countDocuments({ status: 'active' }),
      pendingApprovals: await Partner.countDocuments({ status: 'pending' }),
      suspendedMerchants: await Partner.countDocuments({ status: 'suspended' }),
    };

    // Send response with no caching headers
    return NextResponse.json(
      { merchants, stats, totalCount },
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
