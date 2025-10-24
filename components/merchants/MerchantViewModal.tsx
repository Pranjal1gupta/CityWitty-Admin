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

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 30;

    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${merchant.displayName} - Merchant Details`, margin, yPosition);
    yPosition += 15;

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    };

    // Helper function to add section header
    const addSection = (title: string) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin, yPosition);
      yPosition += 10;
    };

    // Basic Information
    addSection("Basic Information");
    addText(`Merchant ID: ${merchant.merchantId}`);
    addText(`Username: ${merchant.username || "N/A"}`);
    addText(`Merchant Slug: ${merchant.merchantSlug || "N/A"}`);
    addText(
      `Address: ${merchant.streetAddress}, ${merchant.locality}, ${merchant.city}, ${merchant.state} ${merchant.pincode}, ${merchant.country}`
    );
    addText(`Status: ${merchant.status}`);
    addText(`Legal Name: ${merchant.legalName}`);
    addText(`Display Name: ${merchant.displayName}`);
    addText(`Category: ${merchant.category}`);
    addText(`City: ${merchant.city}`);
    addText(
      `Joined Since: ${new Date(merchant.joinedSince).toLocaleDateString()}`
    );
    addText(`Average Rating: ${merchant.averageRating ?? "N/A"}`);
    addText(`Visibility: ${merchant.visibility ? "Visible" : "Hidden"}`);
    addText(`Citywitty Assured: ${merchant.citywittyAssured ? "Yes" : "No"}`);
    addText(`Verified: ${merchant.isVerified ? "Verified" : "Not Verified"}`);
    addText(`Premium Seller: ${merchant.isPremiumSeller ? "Yes" : "No"}`);
    addText(`Top Merchant: ${merchant.isTopMerchant ? "Yes" : "No"}`);
    addText(`Tags: ${merchant.tags?.join(", ") || "N/A"}`);
    addText(`Suspension Reason: ${merchant.suspensionReason || "N/A"}`);
    addText(
      `Onboarding Agent: ${
        merchant.onboardingAgent
          ? `${merchant.onboardingAgent.agentName} (${merchant.onboardingAgent.agentId})`
          : "N/A"
      }`
    );

    // Business Information
    addSection("Business Information");
    addText(`Business Type: ${merchant.businessType}`);
    addText(`Years in Business: ${merchant.yearsInBusiness}`);
    addText(`Average Monthly Revenue: ${merchant.averageMonthlyRevenue}`);
    addText(`Discount Offered: ${merchant.discountOffered}`);
    addText(`Description: ${merchant.description}`);
    addText(`Custom Offer: ${merchant.customOffer || "N/A"}`);
    addText(`Ribbon Tag: ${merchant.ribbonTag || "N/A"}`);
    addText(`Website: ${merchant.website || "N/A"}`);
    if (merchant.socialLinks) {
      addText(
        `Social Links: ${Object.entries(merchant.socialLinks)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ")}`
      );
    }
    addText(`Minimum Order Value: ₹${merchant.minimumOrderValue ?? "N/A"}`);
    if (merchant.offlineDiscount && merchant.offlineDiscount.length > 0) {
      addText("Offline Discounts:");
      merchant.offlineDiscount.forEach((discount, index) => {
        addText(
          `  ${index + 1}. Category: ${discount.category}, Title: ${
            discount.offerTitle
          }, Description: ${discount.offerDescription}, Discount: ${
            discount.discountPercent
          }% up to ₹${discount.discountValue}, Status: ${
            discount.status
          }, Valid Upto: ${new Date(discount.validUpto).toLocaleDateString()}`
        );
      });
    }

    // Legal Information
    addSection("Legal Information");
    addText(`GST Number: ${merchant.gstNumber}`);
    addText(`PAN Number: ${merchant.panNumber}`);
    addText(
      `Address: ${
        [
          merchant.streetAddress,
          merchant.locality,
          merchant.city,
          merchant.state,
          merchant.pincode,
          merchant.country,
        ]
          .filter(Boolean)
          .join(", ") || "N/A"
      }`
    );
    addText(`Map Location: ${merchant.mapLocation || "N/A"}`);
    if (merchant.branchLocations && merchant.branchLocations.length > 0) {
      addText("Branch Locations:");
      merchant.branchLocations.forEach((branch, index) => {
        addText(
          `  ${index + 1}. Branch Name: ${branch.branchName}, Address: ${
            branch.streetAddress
          }, ${branch.locality}, ${branch.city}, ${branch.state} ${
            branch.pincode
          }, ${branch.country}, Map Location: ${branch.mapLocation || "N/A"}`
        );
      });
    }

    // Contact Information
    addSection("Contact Information");
    addText(
      `Email: ${merchant.email} (${
        merchant.emailVerified ? "Verified" : "Not Verified"
      })`
    );
    addText(
      `Phone: ${merchant.phone} (${
        merchant.phoneVerified ? "Verified" : "Not Verified"
      })`
    );
    addText(
      `WhatsApp: ${merchant.whatsapp} ${
        merchant.isWhatsappSame ? "(Same as phone)" : ""
      }`
    );
    addText(
      `Business Hours: ${
        merchant.businessHours
          ? `${merchant.businessHours.open} - ${merchant.businessHours.close}`
          : "N/A"
      }`
    );
    addText(
      `Business Days: ${merchant.businessHours?.days?.join(", ") || "N/A"}`
    );
    addText(
      `Payment Methods: ${merchant.paymentMethodAccepted?.join(", ") || "N/A"}`
    );
    addText(`QR Code Link: ${merchant.qrcodeLink || "N/A"}`);

    // Purchase Package Summary
    addSection("Purchase Package Summary");
    if (merchant.purchasedPackage) {
      addText(`Variant Name: ${merchant.purchasedPackage.variantName}`);
      addText(
        `Purchase Date: ${new Date(
          merchant.purchasedPackage.purchaseDate
        ).toLocaleDateString()}`
      );
      addText(
        `Expiry Date: ${new Date(
          merchant.purchasedPackage.expiryDate
        ).toLocaleDateString()}`
      );
      addText(`Transaction ID: ${merchant.purchasedPackage.transactionId}`);
    } else {
      addText("No package purchased.");
    }

    // Renewal History
    addSection("Renewal History");
    if (merchant.renewal) {
      addText(`Renewed: ${merchant.renewal.isRenewed ? "Yes" : "No"}`);
      addText(
        `Renewal Date: ${
          merchant.renewal.renewalDate
            ? new Date(merchant.renewal.renewalDate).toLocaleDateString()
            : "N/A"
        }`
      );
      addText(
        `Renewal Expiry: ${
          merchant.renewal.renewalExpiry
            ? new Date(merchant.renewal.renewalExpiry).toLocaleDateString()
            : "N/A"
        }`
      );
    } else {
      addText("No renewals.");
    }

    // Banking Details
    addSection("Banking Details");
    if (merchant.bankDetails) {
      addText(`Bank Name: ${merchant.bankDetails.bankName || "N/A"}`);
      addText(
        `Account Holder Name: ${
          merchant.bankDetails.accountHolderName || "N/A"
        }`
      );
      addText(`Account Number: ${merchant.bankDetails.accountNumber || "N/A"}`);
      addText(`IFSC Code: ${merchant.bankDetails.ifscCode || "N/A"}`);
      addText(`Branch Name: ${merchant.bankDetails.branchName || "N/A"}`);
      addText(`UPI ID: ${merchant.bankDetails.upiId || "N/A"}`);
    } else {
      addText("Not provided.");
    }

    // Product & Listing Limits
    addSection("Product & Listing Limits");
    addText(`Listing Limit: ${merchant.ListingLimit ?? "N/A"}`);
    addText(`Added Listings: ${merchant.Addedlistings ?? "N/A"}`);
    if (merchant.products && merchant.products.length > 0) {
      addText("Products:");
      merchant.products.forEach((product, index) => {
        addText(
          `  ${index + 1}. Name: ${product.productName}, Category: ${
            product.productCategory
          }, Original Price: ₹${product.originalPrice}, Discounted Price: ₹${
            product.discountedPrice || "N/A"
          }, Description: ${product.productDescription || "N/A"}`
        );
        if (product.productVariants && product.productVariants.length > 0) {
          addText("    Variants:");
          product.productVariants.forEach((variant) => {
            addText(
              `      - ${variant.name}: ₹${variant.price}, Stock: ${variant.stock}`
            );
          });
        }
      });
    } else {
      addText("No products listed.");
    }

    // Digital Support
    addSection("Digital Support");
    addText(`Total Earnings: ₹${merchant.totalEarnings ?? "N/A"}`);
    addText(`Website Status: ${merchant.isWebsite ? "Enabled" : "Disabled"}`);
    addText(`Graphics: ${merchant.totalGraphics ?? 0} total`);
    if (merchant.ds_graphics && merchant.ds_graphics.length > 0) {
      merchant.ds_graphics.forEach((graphic) => {
        addText(
          `  - ID: ${graphic.graphicId}, Status: ${graphic.status}, Subject: ${graphic.subject}`
        );
      });
    }
    addText(`Reels: ${merchant.totalReels ?? 0} total`);
    if (merchant.ds_reel && merchant.ds_reel.length > 0) {
      merchant.ds_reel.forEach((reel) => {
        addText(
          `  - ID: ${reel.reelId}, Status: ${reel.status}, Subject: ${reel.subject}`
        );
      });
    }
    addText(
      `Podcasts: ${merchant.totalPodcast ?? 0} total, ${
        merchant.completedPodcast ?? 0
      } completed`
    );
    if (merchant.podcastLog && merchant.podcastLog.length > 0) {
      merchant.podcastLog.forEach((podcast) => {
        addText(`  - ${podcast.title}: Status ${podcast.status}`);
      });
    }
    if (merchant.ds_weblog && merchant.ds_weblog.length > 0) {
      addText("Website Logs:");
      merchant.ds_weblog.forEach((weblog) => {
        addText(
          `  - ID: ${weblog.weblog_id}, Status: ${weblog.status}, Description: ${weblog.description}`
        );
      });
    } else {
      addText("No website logs.");
    }

    // Reviews
    addSection("Reviews");
    if (merchant.ratings && merchant.ratings.length > 0) {
      merchant.ratings.forEach((rating, index) => {
        addText(
          `${index + 1}. User: ${rating.user}, Rating: ${
            rating.rating
          }/5, Review: ${rating.review || "N/A"}, Reply: ${
            rating.reply || "N/A"
          }, Date: ${new Date(rating.createdAt || "").toLocaleDateString()}`
        );
      });
    } else {
      addText("No reviews.");
    }

    pdf.save(`${merchant.displayName}_details.pdf`);
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
            <DialogTitle className={`text-xl font-bold bg-blue-50 text-blue-600`}>
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
