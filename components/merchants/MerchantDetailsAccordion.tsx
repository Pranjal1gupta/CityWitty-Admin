import { Merchant } from "@/app/types/Merchant";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface MerchantDetailsAccordionProps {
  merchant: Merchant;
}

const BusinessInformationSection = ({ merchant }: { merchant: Merchant }) => (
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
              {Object.entries(merchant.socialLinks).map(([key, val]) =>
                val ? (
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
                ) : null
              )}
            </div>
          ) : (
            "N/A"
          )}
        </div>
        <div>
          <strong>Logo:</strong>{" "}
          {merchant.logo ? (
            <img src={merchant.logo} alt="Logo" className="w-20 h-20 object-cover" />
          ) : (
            "N/A"
          )}
        </div>
        <div className="md:col-span-2">
          <strong>Store Images:</strong>
          {merchant.storeImages && merchant.storeImages.length > 0 ? (
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
          <strong>Minimum Order Value:</strong> ₹{merchant.minimumOrderValue ?? "N/A"}
        </div>
        <div className="md:col-span-2">
          <strong>Offline Discounts:</strong>
          {merchant.offlineDiscount && merchant.offlineDiscount.length > 0 ? (
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
                    <strong>Description:</strong> {discount.offerDescription}
                  </div>
                  <div>
                    <strong>Discount:</strong> {discount.discountPercent}% up to ₹
                    {discount.discountValue}
                  </div>
                  <div>
                    <strong>Status:</strong> {discount.status}
                  </div>
                  <div>
                    <strong>Valid Upto:</strong>{" "}
                    {new Date(discount.validUpto).toLocaleDateString()}
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
);

const LegalInformationSection = ({ merchant }: { merchant: Merchant }) => (
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
          <strong>Map Location:</strong> {merchant.mapLocation || "N/A"}
        </div>
        <div className="md:col-span-2">
          <strong>Branch Locations:</strong>
          {merchant.branchLocations && merchant.branchLocations.length > 0 ? (
            <div className="space-y-2 mt-1">
              {merchant.branchLocations.map((branch, index) => (
                <div key={index} className="border p-2 rounded">
                  <div>
                    <strong>Branch Name:</strong> {branch.branchName}
                  </div>
                  <div>
                    <strong>Address:</strong> {branch.streetAddress}, {branch.locality}, {branch.city}, {branch.state} {branch.pincode}, {branch.country}
                  </div>
                  <div>
                    <strong>Map Location:</strong> {branch.mapLocation || "N/A"}
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
);

const ContactInformationSection = ({ merchant }: { merchant: Merchant }) => (
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
          <strong>Payment Methods:</strong> {merchant.paymentMethodAccepted?.join(", ") || "N/A"}
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
);

const PurchasePackageSection = ({ merchant }: { merchant: Merchant }) => (
  <Card>
    <CardContent className="pt-4">
      {merchant.purchasedPackage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Variant Name:</strong> {merchant.purchasedPackage.variantName}
          </div>
          <div>
            <strong>Purchase Date:</strong>{" "}
            {new Date(merchant.purchasedPackage.purchaseDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Expiry Date:</strong>{" "}
            {new Date(merchant.purchasedPackage.expiryDate).toLocaleDateString()}
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
);

const RenewalHistorySection = ({ merchant }: { merchant: Merchant }) => (
  <Card>
    <CardContent className="pt-4">
      {merchant.renewal ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Renewed:</strong> {merchant.renewal.isRenewed ? "Yes" : "No"}
          </div>
          <div>
            <strong>Renewal Date:</strong>{" "}
            {merchant.renewal.renewalDate
              ? new Date(merchant.renewal.renewalDate).toLocaleDateString()
              : "N/A"}
          </div>
          <div>
            <strong>Renewal Expiry:</strong>{" "}
            {merchant.renewal.renewalExpiry
              ? new Date(merchant.renewal.renewalExpiry).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      ) : (
        <p className="text-sm">No renewals.</p>
      )}
    </CardContent>
  </Card>
);

const BankingDetailsSection = ({ merchant }: { merchant: Merchant }) => (
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
);

const ProductListingSection = ({ merchant }: { merchant: Merchant }) => (
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
);

const DigitalSupportSection = ({ merchant }: { merchant: Merchant }) => (
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
);

const ReviewsSection = ({ merchant }: { merchant: Merchant }) => (
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
                <strong>Date:</strong> {new Date(rating.createdAt || "").toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm">No reviews.</p>
      )}
    </CardContent>
  </Card>
);

const MerchantDetailsAccordion = ({ merchant }: MerchantDetailsAccordionProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="business">
        <AccordionTrigger>Business Information</AccordionTrigger>
        <AccordionContent>
          <BusinessInformationSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="legal">
        <AccordionTrigger>Legal Information</AccordionTrigger>
        <AccordionContent>
          <LegalInformationSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="contact">
        <AccordionTrigger>Contact Information</AccordionTrigger>
        <AccordionContent>
          <ContactInformationSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="purchase">
        <AccordionTrigger>Purchase Package Summary</AccordionTrigger>
        <AccordionContent>
          <PurchasePackageSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="renewal">
        <AccordionTrigger>Renewal History</AccordionTrigger>
        <AccordionContent>
          <RenewalHistorySection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="banking">
        <AccordionTrigger>Banking Details</AccordionTrigger>
        <AccordionContent>
          <BankingDetailsSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="limits">
        <AccordionTrigger>Product & Listing Limits</AccordionTrigger>
        <AccordionContent>
          <ProductListingSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="digital">
        <AccordionTrigger>Digital Support</AccordionTrigger>
        <AccordionContent>
          <DigitalSupportSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="reviews">
        <AccordionTrigger>Reviews</AccordionTrigger>
        <AccordionContent>
          <ReviewsSection merchant={merchant} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MerchantDetailsAccordion;
