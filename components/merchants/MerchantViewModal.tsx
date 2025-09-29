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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Merchant } from "@/app/types/Merchant";

interface MerchantViewModalProps {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MerchantViewModal({ merchant, isOpen, onClose }: MerchantViewModalProps) {
  if (!merchant) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Merchant Details</DialogTitle>
          <DialogDescription>
            Complete information for{" "}
            <strong className="text-black uppercase">
              {merchant.displayName}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                  <strong>Joined Since:</strong> {new Date(merchant.joinedSince).toLocaleDateString()}
                </div>
                <div>
                  <strong>Average Rating:</strong> {merchant.averageRating ?? "N/A"}
                </div>
                <div>
                  <strong>Visibility:</strong>{" "}
                  {merchant.visibility ? (
                    <Badge className="bg-green-100 text-green-800">Visible</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Hidden</Badge>
                  )}
                </div>
                <div>
                  <strong>Citywitty Assured:</strong>{" "}
                  {merchant.citywittyAssured ? (
                    <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">No</Badge>
                  )}
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
                        <strong>Years in Business:</strong> {merchant.yearsInBusiness}
                      </div>
                      <div>
                        <strong>Average Monthly Revenue:</strong> {merchant.averageMonthlyRevenue}
                      </div>
                      <div>
                        <strong>Discount Offered:</strong> {merchant.discountOffered}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Description:</strong> {merchant.description}
                      </div>
                      <div>
                        <strong>Custom Offer:</strong> {merchant.customOffer || "N/A"}
                      </div>
                      <div>
                        <strong>Ribbon Tag:</strong> {merchant.ribbonTag || "N/A"}
                      </div>
                      <div>
                        <strong>Website:</strong>{" "}
                        {merchant.website ? (
                          <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {merchant.website}
                          </a>
                        ) : "N/A"}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Social Links:</strong>
                        {merchant.socialLinks ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(merchant.socialLinks).map(([key, val]) => (
                              val && (
                                <Badge key={key} variant="outline">
                                  {key}: <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{val}</a>
                                </Badge>
                              )
                            ))}
                          </div>
                        ) : "N/A"}
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
                        {[merchant.streetAddress, merchant.locality, merchant.city, merchant.state, merchant.pincode, merchant.country]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </div>
                      <div>
                        <strong>Map Location:</strong> {merchant.mapLocation || "N/A"}
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
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Not Verified</Badge>
                        )}
                      </div>
                      <div>
                        <strong>Phone:</strong> {merchant.phone}{" "}
                        {merchant.phoneVerified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Not Verified</Badge>
                        )}
                      </div>
                      <div>
                        <strong>WhatsApp:</strong> {merchant.whatsapp}{" "}
                        {merchant.isWhatsappSame ? (
                          <Badge className="bg-blue-100 text-blue-800">Same as phone</Badge>
                        ) : ""}
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
                          <a href={merchant.qrcodeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            View QR
                          </a>
                        ) : "N/A"}
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
                          <strong>Variant Name:</strong> {merchant.purchasedPackage.variantName}
                        </div>
                        <div>
                          <strong>Purchase Date:</strong> {new Date(merchant.purchasedPackage.purchaseDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Expiry Date:</strong> {new Date(merchant.purchasedPackage.expiryDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Transaction ID:</strong> {merchant.purchasedPackage.transactionId}
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
                          <strong>Renewed:</strong> {merchant.renewal.isRenewed ? "Yes" : "No"}
                        </div>
                        <div>
                          <strong>Renewal Date:</strong>{" "}
                          {merchant.renewal.renewalDate ? new Date(merchant.renewal.renewalDate).toLocaleDateString() : "N/A"}
                        </div>
                        <div>
                          <strong>Renewal Expiry:</strong>{" "}
                          {merchant.renewal.renewalExpiry ? new Date(merchant.renewal.renewalExpiry).toLocaleDateString() : "N/A"}
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
                          <strong>Bank Name:</strong> {merchant.bankDetails.bankName || "N/A"}
                        </div>
                        <div>
                          <strong>Account Holder Name:</strong> {merchant.bankDetails.accountHolderName || "N/A"}
                        </div>
                        <div>
                          <strong>Account Number:</strong> {merchant.bankDetails.accountNumber || "N/A"}
                        </div>
                        <div>
                          <strong>IFSC Code:</strong> {merchant.bankDetails.ifscCode || "N/A"}
                        </div>
                        <div>
                          <strong>Branch Name:</strong> {merchant.bankDetails.branchName || "N/A"}
                        </div>
                        <div>
                          <strong>UPI ID:</strong> {merchant.bankDetails.upiId || "N/A"}
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
                        <strong>Listing Limit:</strong> {merchant.ListingLimit ?? "N/A"}
                      </div>
                      <div>
                        <strong>Added Listings:</strong> {merchant.Addedlistings ?? "N/A"}
                      </div>
                    </div>
                    <div className="mt-4">
                      <strong>Products:</strong>
                      {merchant.products && merchant.products.length > 0 ? (
                        <div className="space-y-4 mt-2">
                          {merchant.products.map((product, index) => (
                            <div key={index} className="border p-4 rounded-md">
                              {product.productImages && product.productImages.length > 0 && (
                                <img
                                  src={product.productImages[0]}
                                  alt={product.productName}
                                  className="w-20 h-20 object-cover mb-2 rounded"
                                />
                              )}
                              <h4 className="font-semibold text-sm">{product.productName}</h4>
                              <p className="text-xs text-gray-600 mb-1">Category: {product.productCategory}</p>
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
                              {product.productVariants && product.productVariants.length > 0 && (
                                <div className="mt-2">
                                  <strong className="text-xs">Variants:</strong>
                                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                                    {product.productVariants.map((variant, vIndex) => (
                                      <li key={vIndex}>
                                        {variant.name} - ₹{variant.price} (Stock: {variant.stock})
                                      </li>
                                    ))}
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
                        <strong>Total Earnings:</strong> ₹{merchant.totalEarnings ?? "N/A"}
                      </div>
                      <div>
                        <strong>Website Status:</strong>{" "}
                        {merchant.isWebsite ? (
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <strong>Graphics:</strong> {merchant.totalGraphics ?? 0} total
                      {merchant.ds_graphics && merchant.ds_graphics.length > 0 && (
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                          {merchant.ds_graphics.map((graphic, index) => (
                            <li key={index}>
                              ID: {graphic.graphicId}, Status: {graphic.status}, Subject: {graphic.subject}
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
                              ID: {reel.reelId}, Status: {reel.status}, Subject: {reel.subject}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <strong>Podcasts:</strong> {merchant.totalPodcast ?? 0} total, {merchant.completedPodcast ?? 0} completed
                      {merchant.podcastLog && merchant.podcastLog.length > 0 && (
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
                              ID: {weblog.weblog_id}, Status: {weblog.status}, Description: {weblog.description}
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
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
