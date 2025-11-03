import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Merchant } from "@/app/types/Merchant";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Users } from "lucide-react";

interface MerchantViewModalProps {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MerchantViewModal({
  merchant,
  isOpen,
  onClose,
}: MerchantViewModalProps) {
  if (!merchant) return null;

  const contentRef = useRef<HTMLDivElement>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDownloadPDF = () => {
    // Enhanced PDF generation with complete merchant details
    const pdf = new jsPDF("p", "mm", "a4") as any;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 10;
    let pageCount = 1;

    // --- Helper functions ---
    const addPageHeader = () => {
      pdf.setFillColor(187, 222, 251); // Light blue
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

    // --- Initial Header ---
    addPageHeader();
    y = 50;

    // --- Merchant ID Badge ---
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

    // --- Basic Information ---
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

    // --- Business Information ---
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

    // Offline Discount Details
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

    // Social Links
    if (merchant.socialLinks && Object.keys(merchant.socialLinks).length > 0) {
      addSubsection("Social Links");
      Object.entries(merchant.socialLinks).forEach(([key, val]) => {
        if (val) addField(key, val);
      });
      y += 10;
    }

    // --- Legal Information ---
    addSectionHeader("Legal Information");
    addField("GST Number", merchant.gstNumber);
    addField("PAN Number", merchant.panNumber);
    addField("Map Location", merchant.mapLocation || "N/A");
    addDivider();

    // Branch Locations
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

    // --- Contact Information ---
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

    // --- Purchase Package ---
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

    // --- Banking Details ---
    addSectionHeader("Banking Details");
    if (merchant.bankDetails) {
      addField("Bank Name", merchant.bankDetails.bankName);
      addField("Account Holder", merchant.bankDetails.accountHolderName);
      addField("Account Number", merchant.bankDetails.accountNumber);
      addField("IFSC Code", merchant.bankDetails.ifscCode);
      addField("UPI ID", merchant.bankDetails.upiId);
    } else addField("Bank Info", "Not Provided.");

    // --- Renewal History ---
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

    // --- Product and Listing Limits ---
    addSectionHeader("Product and Listing Limits");
    addField("Listing Limit", merchant.ListingLimit || "N/A");
    addField("Added Listings", merchant.Addedlistings || "0");
    addField("Remaining Listings", merchant.ListingLimit && merchant.Addedlistings ? merchant.ListingLimit - merchant.Addedlistings : "N/A");
    addField("Total Graphics", merchant.totalGraphics || "0");
    addField("Total Reels", merchant.totalReels || "0");
    addField("Has Website", merchant.isWebsite ? "Yes" : "No");
    addDivider();

    // --- Digital Support ---
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

    // --- Reviews ---
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

    // --- Footer ---
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-4xl w-full">
        {/* <DialogHeader>
          <DialogTitle>Merchant Details</DialogTitle>
          <DialogDescription>
            Complete information for{" "}
            <strong className="text-black uppercase">
              {merchant.displayName}
            </strong>
          </DialogDescription>
        </DialogHeader> */}
        <DialogHeader className="pb-6">
          {/* Header Title + Icon */}
          <div
            className={`flex items-center gap-3 mb-2 p-4 rounded-lg bg-blue-50 border-blue-200 border`}
          >
            <Users className="h-6 w-6 text-blue-600 bg-blue-100 p-1 rounded-full" />
            <DialogTitle
              className={`text-xl font-bold bg-blue-50 text-blue-600`}
            >
              Merchant Details
            </DialogTitle>
          </div>

          {/* Description */}
          <DialogDescription className="text-gray-600 leading-relaxed">
            Complete information for{" "}
            <strong className="text-black uppercase">
              {merchant.displayName}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div ref={contentRef} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Merchant ID:</strong> {merchant.merchantId}
                </div>
                <div>
                  <strong>Username:</strong> {merchant.username || "N/A"}
                </div>
                <div>
                  <strong>Merchant Slug:</strong>{" "}
                  {merchant.merchantSlug ? (
                    <a
                      href={`https://www.citywitty.com/merchants/${merchant.merchantSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {merchant.merchantSlug}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div>
                  <strong>Address:</strong> {merchant.streetAddress},{" "}
                  {merchant.locality}, {merchant.city}, {merchant.state}{" "}
                  {merchant.pincode}, {merchant.country}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusBadge(merchant.status)}
                </div>
                <div>
                  <strong>Legal Name:</strong> {merchant.legalName}
                </div>
                <div>
                  <strong>Display Name:</strong> {merchant.displayName}
                </div>
                <div>
                  <strong>Category:</strong> {merchant.category}
                </div>
                <div>
                  <strong>City:</strong> {merchant.city}
                </div>
                <div>
                  <strong>Joined Since:</strong>{" "}
                  {new Date(merchant.joinedSince).toLocaleDateString()}
                </div>
                <div>
                  <strong>Average Rating:</strong>{" "}
                  {merchant.averageRating ?? "N/A"}
                </div>
                <div>
                  <strong>Visibility:</strong>{" "}
                  {merchant.visibility ? (
                    <Badge className="bg-green-100 text-green-800">
                      Visible
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Hidden</Badge>
                  )}
                </div>
                <div>
                  <strong>Citywitty Assured:</strong>{" "}
                  {merchant.citywittyAssured ? (
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">No</Badge>
                  )}
                </div>
                <div>
                  <strong>Verified:</strong>{" "}
                  {merchant.isVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div>
                  <strong>Premium Seller:</strong>{" "}
                  {merchant.isPremiumSeller ? (
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">No</Badge>
                  )}
                </div>
                <div>
                  <strong>Top Merchant:</strong>{" "}
                  {merchant.isTopMerchant ? (
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">No</Badge>
                  )}
                </div>
                <div>
                  <strong>Tags:</strong> {merchant.tags?.join(", ") || "N/A"}
                </div>
                <div>
                  <strong>Suspension Reason:</strong>{" "}
                  {merchant.suspensionReason || "N/A"}
                </div>
                <div>
                  <strong>Onboarding Agent:</strong>{" "}
                  {merchant.onboardingAgent
                    ? `${merchant.onboardingAgent.agentName} (${merchant.onboardingAgent.agentId})`
                    : "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accordion for other sections */}
          <Accordion type="single" collapsible className="w-full">
            {/* Business Information */}
            <AccordionItem value="business">
              <AccordionTrigger>Business Information</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Business Type:</strong> {merchant.businessType}
                      </div>
                      <div>
                        <strong>Years in Business:</strong>{" "}
                        {merchant.yearsInBusiness}
                      </div>
                      <div>
                        <strong>Average Monthly Revenue:</strong>{" "}
                        {merchant.averageMonthlyRevenue}
                      </div>
                      <div>
                        <strong>Discount Offered:</strong>{" "}
                        {merchant.discountOffered}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Description:</strong> {merchant.description}
                      </div>
                      <div>
                        <strong>Custom Offer:</strong>{" "}
                        {merchant.customOffer || "N/A"}
                      </div>
                      <div>
                        <strong>Ribbon Tag:</strong>{" "}
                        {merchant.ribbonTag || "N/A"}
                      </div>
                      <div>
                        <strong>Website:</strong>{" "}
                        {merchant.website ? (
                          <a
                            href={merchant.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {merchant.website}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Social Links:</strong>
                        {merchant.socialLinks ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(merchant.socialLinks).map(
                              ([key, val]) =>
                                val && (
                                  <Badge key={key} variant="outline">
                                    {key}:{" "}
                                    <a
                                      href={val}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline"
                                    >
                                      {val}
                                    </a>
                                  </Badge>
                                )
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div>
                        <strong>Logo:</strong>{" "}
                        {merchant.logo ? (
                          <img
                            src={merchant.logo}
                            alt="Logo"
                            className="w-20 h-20 object-cover"
                          />
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Store Images:</strong>
                        {merchant.storeImages &&
                        merchant.storeImages.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {merchant.storeImages.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Store ${index + 1}`}
                                className="w-20 h-20 object-cover"
                              />
                            ))}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div>
                        <strong>Minimum Order Value:</strong> ₹
                        {merchant.minimumOrderValue ?? "N/A"}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Offline Discounts:</strong>
                        {merchant.offlineDiscount &&
                        merchant.offlineDiscount.length > 0 ? (
                          <div className="space-y-2 mt-1">
                            {merchant.offlineDiscount.map((discount, index) => (
                              <div key={index} className="border p-2 rounded">
                                <div>
                                  <strong>Category:</strong> {discount.category}
                                </div>
                                <div>
                                  <strong>Title:</strong> {discount.offerTitle}
                                </div>
                                <div>
                                  <strong>Description:</strong>{" "}
                                  {discount.offerDescription}
                                </div>
                                <div>
                                  <strong>Discount:</strong>{" "}
                                  {discount.discountPercent}% up to ₹
                                  {discount.discountValue}
                                </div>
                                <div>
                                  <strong>Status:</strong> {discount.status}
                                </div>
                                <div>
                                  <strong>Valid Upto:</strong>{" "}
                                  {new Date(
                                    discount.validUpto
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Legal Information */}
            <AccordionItem value="legal">
              <AccordionTrigger>Legal Information</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>GST Number:</strong> {merchant.gstNumber}
                      </div>
                      <div>
                        <strong>PAN Number:</strong> {merchant.panNumber}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Address:</strong>{" "}
                        {[
                          merchant.streetAddress,
                          merchant.locality,
                          merchant.city,
                          merchant.state,
                          merchant.pincode,
                          merchant.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </div>
                      <div>
                        <strong>Map Location:</strong>{" "}
                        {merchant.mapLocation || "N/A"}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Branch Locations:</strong>
                        {merchant.branchLocations &&
                        merchant.branchLocations.length > 0 ? (
                          <div className="space-y-2 mt-1">
                            {merchant.branchLocations.map((branch, index) => (
                              <div key={index} className="border p-2 rounded">
                                <div>
                                  <strong>Branch Name:</strong>{" "}
                                  {branch.branchName}
                                </div>
                                <div>
                                  <strong>Address:</strong>{" "}
                                  {branch.streetAddress}, {branch.locality},{" "}
                                  {branch.city}, {branch.state} {branch.pincode}
                                  , {branch.country}
                                </div>
                                <div>
                                  <strong>Map Location:</strong>{" "}
                                  {branch.mapLocation || "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Contact Information */}
            <AccordionItem value="contact">
              <AccordionTrigger>Contact Information</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Email:</strong> {merchant.email}{" "}
                        {merchant.emailVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <div>
                        <strong>Phone:</strong> {merchant.phone}{" "}
                        {merchant.phoneVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <div>
                        <strong>WhatsApp:</strong> {merchant.whatsapp}{" "}
                        {merchant.isWhatsappSame ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            Same as phone
                          </Badge>
                        ) : (
                          ""
                        )}
                      </div>
                      <div>
                        <strong>Business Hours:</strong>{" "}
                        {merchant.businessHours
                          ? `${merchant.businessHours.open} - ${merchant.businessHours.close}`
                          : "N/A"}
                      </div>
                      <div>
                        <strong>Business Days:</strong>{" "}
                        {merchant.businessHours?.days?.join(", ") || "N/A"}
                      </div>
                      <div>
                        <strong>Payment Methods:</strong>{" "}
                        {merchant.paymentMethodAccepted?.join(", ") || "N/A"}
                      </div>
                      <div>
                        <strong>QR Code Link:</strong>{" "}
                        {merchant.qrcodeLink ? (
                          <a
                            href={merchant.qrcodeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View QR
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Purchase Package Summary */}
            <AccordionItem value="purchase">
              <AccordionTrigger>Purchase Package Summary</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    {merchant.purchasedPackage ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Variant Name:</strong>{" "}
                          {merchant.purchasedPackage.variantName}
                        </div>
                        <div>
                          <strong>Purchase Date:</strong>{" "}
                          {new Date(
                            merchant.purchasedPackage.purchaseDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Expiry Date:</strong>{" "}
                          {new Date(
                            merchant.purchasedPackage.expiryDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Transaction ID:</strong>{" "}
                          {merchant.purchasedPackage.transactionId}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">No package purchased.</p>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Renewal History */}
            <AccordionItem value="renewal">
              <AccordionTrigger>Renewal History</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    {merchant.renewal ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Renewed:</strong>{" "}
                          {merchant.renewal.isRenewed ? "Yes" : "No"}
                        </div>
                        <div>
                          <strong>Renewal Date:</strong>{" "}
                          {merchant.renewal.renewalDate
                            ? new Date(
                                merchant.renewal.renewalDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div>
                          <strong>Renewal Expiry:</strong>{" "}
                          {merchant.renewal.renewalExpiry
                            ? new Date(
                                merchant.renewal.renewalExpiry
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">No renewals.</p>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Banking Details */}
            <AccordionItem value="banking">
              <AccordionTrigger>Banking Details</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    {merchant.bankDetails ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Bank Name:</strong>{" "}
                          {merchant.bankDetails.bankName || "N/A"}
                        </div>
                        <div>
                          <strong>Account Holder Name:</strong>{" "}
                          {merchant.bankDetails.accountHolderName || "N/A"}
                        </div>
                        <div>
                          <strong>Account Number:</strong>{" "}
                          {merchant.bankDetails.accountNumber || "N/A"}
                        </div>
                        <div>
                          <strong>IFSC Code:</strong>{" "}
                          {merchant.bankDetails.ifscCode || "N/A"}
                        </div>
                        <div>
                          <strong>Branch Name:</strong>{" "}
                          {merchant.bankDetails.branchName || "N/A"}
                        </div>
                        <div>
                          <strong>UPI ID:</strong>{" "}
                          {merchant.bankDetails.upiId || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">Not provided.</p>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Product & Listing Limits */}
            <AccordionItem value="limits">
              <AccordionTrigger>Product & Listing Limits</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Listing Limit:</strong>{" "}
                        {merchant.ListingLimit ?? "N/A"}
                      </div>
                      <div>
                        <strong>Added Listings:</strong>{" "}
                        {merchant.Addedlistings ?? "N/A"}
                      </div>
                    </div>
                    <div className="mt-4">
                      <strong>Products:</strong>
                      {merchant.products && merchant.products.length > 0 ? (
                        <div className="space-y-4 mt-2">
                          {merchant.products.map((product, index) => (
                            <div key={index} className="border p-4 rounded-md">
                              {product.productImages &&
                                product.productImages.length > 0 && (
                                  <img
                                    src={product.productImages[0]}
                                    alt={product.productName}
                                    className="w-20 h-20 object-cover mb-2 rounded"
                                  />
                                )}
                              <h4 className="font-semibold text-sm">
                                {product.productName}
                              </h4>
                              <p className="text-xs text-gray-600 mb-1">
                                Category: {product.productCategory}
                              </p>
                              <p className="text-sm mb-1">
                                Original: ₹{product.originalPrice}
                                {product.discountedPrice && (
                                  <span className="text-red-600 ml-2 line-through">
                                    ₹{product.discountedPrice}
                                  </span>
                                )}
                              </p>
                              {product.productDescription && (
                                <p className="text-xs mt-1 mb-2 text-gray-700">
                                  {product.productDescription}
                                </p>
                              )}
                              {product.productVariants &&
                                product.productVariants.length > 0 && (
                                  <div className="mt-2">
                                    <strong className="text-xs">
                                      Variants:
                                    </strong>
                                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                                      {product.productVariants.map(
                                        (variant, vIndex) => (
                                          <li key={vIndex}>
                                            {variant.name} - ₹{variant.price}{" "}
                                            (Stock: {variant.stock})
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm mt-2">No products listed.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Digital Support */}
            <AccordionItem value="digital">
              <AccordionTrigger>Digital Support</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Total Earnings:</strong> ₹
                        {merchant.totalEarnings ?? "N/A"}
                      </div>
                      <div>
                        <strong>Website Status:</strong>{" "}
                        {merchant.isWebsite ? (
                          <Badge className="bg-green-100 text-green-800">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Disabled
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <strong>Graphics:</strong> {merchant.totalGraphics ?? 0}{" "}
                      total
                      {merchant.ds_graphics &&
                        merchant.ds_graphics.length > 0 && (
                          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            {merchant.ds_graphics.map((graphic, index) => (
                              <li key={index}>
                                ID: {graphic.graphicId}, Status:{" "}
                                {graphic.status}, Subject: {graphic.subject}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                    <div>
                      <strong>Reels:</strong> {merchant.totalReels ?? 0} total
                      {merchant.ds_reel && merchant.ds_reel.length > 0 && (
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                          {merchant.ds_reel.map((reel, index) => (
                            <li key={index}>
                              ID: {reel.reelId}, Status: {reel.status}, Subject:{" "}
                              {reel.subject}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <strong>Podcasts:</strong> {merchant.totalPodcast ?? 0}{" "}
                      total, {merchant.completedPodcast ?? 0} completed
                      {merchant.podcastLog &&
                        merchant.podcastLog.length > 0 && (
                          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            {merchant.podcastLog.map((podcast, index) => (
                              <li key={index}>
                                {podcast.title} - Status: {podcast.status}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                    <div>
                      <strong>Website Logs:</strong>
                      {merchant.ds_weblog && merchant.ds_weblog.length > 0 ? (
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                          {merchant.ds_weblog.map((weblog, index) => (
                            <li key={index}>
                              ID: {weblog.weblog_id}, Status: {weblog.status},
                              Description: {weblog.description}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs mt-2">No website logs.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Reviews */}
            <AccordionItem value="reviews">
              <AccordionTrigger>Reviews</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    {merchant.ratings && merchant.ratings.length > 0 ? (
                      <div className="space-y-4">
                        {merchant.ratings.map((rating, index) => (
                          <div key={index} className="border p-4 rounded-md">
                            <div>
                              <strong>User:</strong> {rating.user}
                            </div>
                            <div>
                              <strong>Rating:</strong> {rating.rating}/5
                            </div>
                            <div>
                              <strong>Review:</strong> {rating.review || "N/A"}
                            </div>
                            <div>
                              <strong>Reply:</strong> {rating.reply || "N/A"}
                            </div>
                            <div>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                rating.createdAt || ""
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">No reviews.</p>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
