import jsPDF from "jspdf";
import { Merchant } from "@/app/types/Merchant";

const generateMerchantPdf = (merchant: Merchant) => {
  const pdf = new jsPDF("p", "mm", "a4") as any;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 10;
  let pageCount = 1;

  const addPageHeader = () => {
    pdf.setFillColor(187, 222, 251);
    pdf.rect(0, 0, pageWidth, 40, "F");
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(1);
    pdf.rect(0, 0, pageWidth, 40);
    pdf.addImage(
      "https://partner.citywitty.com/logo2.png",
      "PNG",
      10,
      5,
      60,
      20
    );
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Merchant Details Report", 20, 35);
    pdf.setFontSize(8);
    pdf.text(
      `Generated on: ${new Date().toISOString().split("T")[0]}`,
      pageWidth - 60,
      20
    );
    pdf.setDrawColor(25, 118, 210);
    pdf.setLineWidth(0.5);
    pdf.line(0, 42, pageWidth, 42);
  };

  const addPageFooter = () => {
    pdf.setFillColor(248, 249, 250);
    pdf.rect(0, pageHeight - 25, pageWidth, 25, "F");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(117, 117, 117);
    pdf.text(
      "This report was generated from CityWitty Merchant Hub.",
      20,
      pageHeight - 18
    );
    pdf.text(
      "This is a system-generated file and doesn't require a signature.",
      20,
      pageHeight - 12
    );
    pdf.text("For support, contact: support@citywitty.com", 20, pageHeight - 6);
    pdf.text(`Page ${pageCount}`, pageWidth - 30, pageHeight - 8);
  };

  const addNewPage = () => {
    addPageFooter();
    pdf.addPage();
    pageCount++;
    addPageHeader();
    y = 50;
  };

  const checkPageSpace = (requiredSpace: number = 30) => {
    if (y > pageHeight - requiredSpace) {
      addNewPage();
    }
  };

  const addSectionHeader = (title: string) => {
    checkPageSpace(35);
    pdf.setFillColor(248, 249, 250);
    pdf.rect(15, y - 3, pageWidth - 30, 12, "F");
    pdf.setDrawColor(25, 118, 210);
    pdf.rect(15, y - 3, pageWidth - 30, 12);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(25, 118, 210);
    pdf.text(title, 20, y + 4);
    y += 18;
  };

  const addField = (label: string, value: any, isImportant = false) => {
    checkPageSpace(15);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(69, 90, 100);
    pdf.text(`${label}:`, 20, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...(isImportant ? [25, 118, 210] : [33, 33, 33]));
    let displayValue = value || "N/A";
    if (Array.isArray(value)) displayValue = value.length > 0 ? value.join(", ") : "N/A";
    const safeValue = String(displayValue).replace(/[^\x00-\x7F]/g, "");
    const splitText = pdf.splitTextToSize(safeValue, pageWidth - 80);
    splitText.forEach((line: string, i: number) => {
      checkPageSpace(15);
      pdf.text(line, 80, y + i * 6);
    });
    y += Math.max(8, splitText.length * 6);
  };

  const addDivider = () => {
    checkPageSpace(10);
    pdf.setDrawColor(224, 224, 224);
    pdf.setLineWidth(0.3);
    pdf.line(20, y, pageWidth - 20, y);
    y += 8;
  };

  const addSubsection = (title: string) => {
    checkPageSpace(12);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(56, 142, 142);
    pdf.text(title, 20, y);
    y += 8;
  };

  addPageHeader();
  y = 50;

  for (let i = 0; i < 15; i++) {
    const ratio = i / 15;
    const r = Math.round(129 + (56 - 129) * ratio);
    const g = Math.round(199 + (142 - 199) * ratio);
    const b = Math.round(132 + (60 - 132) * ratio);
    pdf.setFillColor(r, g, b);
    pdf.rect(15, y - 5 + i, 60, 1, "F");
  }

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text(`ID: ${merchant.merchantId || "N/A"}`, 25, y + 3);
  pdf.setTextColor(0, 0, 0);
  y += 25;

  addSectionHeader("Basic Information");
  addField("Legal Name", merchant.legalName, true);
  addField("Display Name", merchant.displayName, true);
  addField("Username", merchant.username);
  addField("Merchant Slug", merchant.merchantSlug);
  addField("Category", merchant.category);
  addField("Status", merchant.status);
  addField("Average Rating", merchant.averageRating ? `${merchant.averageRating}/5` : "N/A");
  addField("Premium Seller", merchant.isPremiumSeller ? "Yes" : "No");
  addField("Top Merchant", merchant.isTopMerchant ? "Yes" : "No");
  addField("CityWitty Assured", merchant.citywittyAssured ? "Yes" : "No");
  addField("Verified", merchant.isVerified ? "Yes" : "No");
  addField("Visibility", merchant.visibility ? "Visible" : "Hidden");
  addField(
    "Joined Since",
    new Date(merchant.joinedSince).toLocaleDateString()
  );
  addField("Tags", merchant.tags?.join(", ") || "N/A");
  addField("Suspension Reason", merchant.suspensionReason || "N/A");
  addField(
    "Onboarding Agent",
    merchant.onboardingAgent
      ? `${merchant.onboardingAgent.agentName} (${merchant.onboardingAgent.agentId})`
      : "N/A"
  );
  addDivider();
  addField(
    "Address",
    `${merchant.streetAddress}, ${merchant.locality}, ${merchant.city}, ${merchant.state} ${merchant.pincode}, ${merchant.country}`
  );
  y += 10;

  addSectionHeader("Business Information");
  addField("Business Type", merchant.businessType);
  addField("Years in Business", merchant.yearsInBusiness);
  addField("Monthly Revenue", merchant.averageMonthlyRevenue);
  addField("Discount Offered", merchant.discountOffered);
  addField("Description", merchant.description);
  addField("Custom Offer", merchant.customOffer || "N/A");
  addField("Ribbon Tag", merchant.ribbonTag || "N/A");
  addField("Minimum Order Value", merchant.minimumOrderValue ? `₹${merchant.minimumOrderValue}` : "N/A");
  addField("Website", merchant.website || "N/A");
  addField("Total Earnings", merchant.totalEarnings ? `₹${merchant.totalEarnings}` : "N/A");
  addDivider();

  if (merchant.offlineDiscount && merchant.offlineDiscount.length > 0) {
    addSubsection("Offline Discount Details");
    merchant.offlineDiscount.forEach((discount, index) => {
      checkPageSpace(20);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(56, 142, 142);
      pdf.text(`Discount ${index + 1}:`, 20, y);
      y += 6;
      addField("Category", discount.category);
      addField("Offer Title", discount.offerTitle);
      addField("Offer Description", discount.offerDescription);
      addField("Discount Value", `₹${discount.discountValue}`);
      addField("Discount Percent", `${discount.discountPercent}%`);
      addField("Status", discount.status);
      addField("Valid Upto", new Date(discount.validUpto).toLocaleDateString());
      if (index < merchant.offlineDiscount!.length - 1) {
        addDivider();
      }
    });
    y += 10;
  }

  if (merchant.socialLinks && Object.keys(merchant.socialLinks).length > 0) {
    addSubsection("Social Links");
    Object.entries(merchant.socialLinks).forEach(([key, val]) => {
      if (val) addField(key, val);
    });
    y += 10;
  }

  addSectionHeader("Legal Information");
  addField("GST Number", merchant.gstNumber);
  addField("PAN Number", merchant.panNumber);
  addField("Map Location", merchant.mapLocation || "N/A");
  addDivider();

  if (merchant.branchLocations && merchant.branchLocations.length > 0) {
    addSubsection("Branch Locations");
    merchant.branchLocations!.forEach((branch, index) => {
      checkPageSpace(20);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(56, 142, 142);
      pdf.text(`Branch ${index + 1}: ${branch.branchName}`, 20, y);
      y += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(33, 33, 33);
      addField("Address", `${branch.streetAddress}, ${branch.locality}, ${branch.city}, ${branch.state} ${branch.pincode}, ${branch.country}`);
      addField("Map Location", branch.mapLocation || "N/A");
      if (index < merchant.branchLocations!.length - 1) {
        addDivider();
      }
    });
    y += 10;
  }

  addSectionHeader("Contact Information");
  addField("Email", merchant.email);
  addField("Phone", merchant.phone);
  addField("WhatsApp", merchant.whatsapp);
  addField(
    "Business Hours",
    merchant.businessHours
      ? `${merchant.businessHours.open} - ${merchant.businessHours.close}`
      : "N/A"
  );
  addField("Business Days", merchant.businessHours?.days?.join(", "));
  addField("Payment Methods", merchant.paymentMethodAccepted?.join(", "));
  y += 10;

  addSectionHeader("Purchase Package Summary");
  if (merchant.purchasedPackage) {
    addField("Variant Name", merchant.purchasedPackage.variantName);
    addField(
      "Purchase Date",
      new Date(merchant.purchasedPackage.purchaseDate).toLocaleDateString()
    );
    addField(
      "Expiry Date",
      new Date(merchant.purchasedPackage.expiryDate).toLocaleDateString()
    );
    addField("Transaction ID", merchant.purchasedPackage.transactionId);
  } else addField("Package", "No package purchased.");

  addSectionHeader("Banking Details");
  if (merchant.bankDetails) {
    addField("Bank Name", merchant.bankDetails.bankName);
    addField("Account Holder", merchant.bankDetails.accountHolderName);
    addField("Account Number", merchant.bankDetails.accountNumber);
    addField("IFSC Code", merchant.bankDetails.ifscCode);
    addField("UPI ID", merchant.bankDetails.upiId);
  } else addField("Bank Info", "Not Provided.");

  addSectionHeader("Renewal History");
  if (merchant.renewal) {
    addField("Is Renewed", merchant.renewal.isRenewed ? "Yes" : "No");
    if (merchant.renewal.renewalDate) {
      addField("Renewal Date", new Date(merchant.renewal.renewalDate).toLocaleDateString());
    }
    if (merchant.renewal.renewalExpiry) {
      addField("Renewal Expiry", new Date(merchant.renewal.renewalExpiry).toLocaleDateString());
    }
  } else {
    addField("Renewal Status", "No renewal data available");
  }
  addDivider();

  addSectionHeader("Product and Listing Limits");
  addField("Listing Limit", merchant.ListingLimit || "N/A");
  addField("Added Listings", merchant.Addedlistings || "0");
  addField("Remaining Listings", merchant.ListingLimit && merchant.Addedlistings ? merchant.ListingLimit - merchant.Addedlistings : "N/A");
  addField("Total Graphics", merchant.totalGraphics || "0");
  addField("Total Reels", merchant.totalReels || "0");
  addField("Has Website", merchant.isWebsite ? "Yes" : "No");
  addDivider();

  addSectionHeader("Digital Support");
  let hasSupportData = false;
  if (merchant.ds_graphics && merchant.ds_graphics.length > 0) {
    hasSupportData = true;
    addSubsection("Graphics Requests");
    merchant.ds_graphics.forEach((graphic, index) => {
      checkPageSpace(15);
      addField(`Request ${index + 1}`, graphic.requestCategory);
      addField("Status", graphic.status);
      addField("Request Date", new Date(graphic.requestDate).toLocaleDateString());
      if (graphic.completionDate) {
        addField("Completion Date", new Date(graphic.completionDate).toLocaleDateString());
      }
      if (index < merchant.ds_graphics!.length - 1) {
        addDivider();
      }
    });
    y += 8;
  }

  if (merchant.ds_reel && merchant.ds_reel.length > 0) {
    hasSupportData = true;
    addSubsection("Reel Requests");
    merchant.ds_reel.forEach((reel, index) => {
      checkPageSpace(15);
      addField(`Reel ${index + 1}`, reel.subject);
      addField("Status", reel.status);
      addField("Request Date", new Date(reel.requestDate).toLocaleDateString());
      if (reel.completionDate) {
        addField("Completion Date", new Date(reel.completionDate).toLocaleDateString());
      }
      if (index < merchant.ds_reel!.length - 1) {
        addDivider();
      }
    });
    y += 8;
  }

  if (merchant.ds_weblog && merchant.ds_weblog.length > 0) {
    hasSupportData = true;
    addSubsection("Weblog Requests");
    merchant.ds_weblog.forEach((weblog, index) => {
      checkPageSpace(15);
      addField(`Weblog ${index + 1}`, weblog.description);
      addField("Status", weblog.status);
      if (weblog.completionDate) {
        addField("Completion Date", new Date(weblog.completionDate).toLocaleDateString());
      }
      if (index < merchant.ds_weblog!.length - 1) {
        addDivider();
      }
    });
    y += 8;
  }

  if (!hasSupportData) {
    addField("Support Data", "No support requests available");
  }
  addDivider();

  addSectionHeader("Reviews");
  if (merchant.ratings && merchant.ratings.length > 0) {
    addField("Total Reviews", merchant.ratings.length);
    addField("Average Rating", merchant.averageRating ? `${merchant.averageRating}/5` : "N/A");
    y += 8;
    merchant.ratings.slice(0, 5).forEach((rating, index) => {
      checkPageSpace(20);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(56, 142, 142);
      pdf.text(`Review ${index + 1}:`, 20, y);
      y += 6;
      addField("Rating", `${rating.rating}/5 Stars`);
      addField("Reviewer", rating.user);
      if (rating.review) {
        addField("Review", rating.review);
      }
      if (rating.reply) {
        addField("Reply", rating.reply);
      }
      if (rating.createdAt) {
        addField("Date", new Date(rating.createdAt).toLocaleDateString());
      }
      if (index < Math.min(4, merchant.ratings!.length - 1)) {
        addDivider();
      }
    });
    if (merchant.ratings.length > 5) {
      y += 8;
      addField("Total Reviews", `${merchant.ratings.length} (Showing first 5)`);
    }
  } else {
    addField("Reviews", "No reviews available");
  }
  addDivider();

  if (y > pageHeight - 40) {
    pdf.addPage();
    y = 20;
  }
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, pageHeight - 25, pageWidth, 25, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(117, 117, 117);
  pdf.text(
    "This report was generated from CityWitty Merchant Hub.",
    20,
    pageHeight - 18
  );
  pdf.text(
    "This is a system-generated file and doesn’t require a signature.",
    20,
    pageHeight - 12
  );
  pdf.text("For support, contact: support@citywitty.com", 20, pageHeight - 6);
  pdf.text(`Page 1 of 1`, pageWidth - 30, pageHeight - 8);

  pdf.save(`${merchant.displayName || "CityWitty_Merchant"}_Details.pdf`);
};

export default generateMerchantPdf;
