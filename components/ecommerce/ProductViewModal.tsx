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
import { Product } from "@/app/types/ecommerce";
import { useRef } from "react";
import jsPDF from "jspdf";
import { Download, Package } from "lucide-react";

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductViewModal({
  product,
  isOpen,
  onClose,
}: ProductViewModalProps) {
  if (!product) return null;

  const contentRef = useRef<HTMLDivElement>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    } else if (stock < 20) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
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
    pdf.text(`${product.name} - Product Details`, margin, yPosition);
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
    addText(`Product ID: ${product.id}`);
    addText(`Name: ${product.name}`);
    addText(`Category: ${product.category}`);
    addText(`Merchant: ${product.merchant}`);
    addText(`Description: ${product.description}`);
    addText(`Brand: ${product.brand || "N/A"}`);
    addText(`Status: ${product.status}`);
    addText(`Stock: ${product.stock} units`);
    addText(`Price: Rs. ${product.price}`);
    addText(`Discount Price: Rs. ${product.discountPrice}`);
    addText(`Sales: ${product.sales} sold`);
    addText(`Revenue: Rs. ${product.revenue.toFixed(2)}`);

    // Variants
    if (product.productVariants && product.productVariants.length > 0) {
      addSection("Variants");
      product.productVariants.forEach((variant, index) => {
        addText(`Variant ${index + 1}:`, 11, true);
        if (variant.variantId) addText(`  ID: ${variant.variantId}`);
        if (variant.name) addText(`  Name: ${variant.name}`);
        if (variant.price) addText(`  Price: Rs. ${variant.price}`);
        if (variant.stock) addText(`  Stock: ${variant.stock} units`);
        if (variant.isAvailableStock !== undefined) 
          addText(`  Available: ${variant.isAvailableStock ? "Yes" : "No"}`);
        yPosition += 2;
      });
    }

    // Highlights
    if (product.productHighlights && product.productHighlights.length > 0) {
      addSection("Highlights");
      product.productHighlights.forEach((highlight, index) => {
        addText(`${index + 1}. ${highlight}`);
      });
    }

    // FAQ
    if (product.faq && product.faq.length > 0) {
      addSection("FAQ");
      product.faq.forEach((faqItem, index) => {
        addText(`Q${index + 1}: ${faqItem.question}`);
        addText(`A${index + 1}: ${faqItem.answer}`);
      });
    }

    // Warranty & Delivery
    addSection("Warranty & Delivery");
    addText(`Warranty: ${product.isWarranty ? "Yes" : "No"}`);
    if (product.warrantyDescription) {
      addText(`Warranty Description: ${product.warrantyDescription}`);
    }
    addText(`Replacement: ${product.isReplacement ? "Yes" : "No"}`);
    if (product.replacementDays) {
      addText(`Replacement Days: ${product.replacementDays}`);
    }
    addText(`ETA: ${product.eta}`);
    addText(`Deliverable Locations: ${product.deliverableLocations.join(", ")}`);
    addText(`Delivery Fee: Rs. ${product.deliveryFee || 0}`);
    addText(`Order Handling Fee: Rs. ${product.orderHandlingFee || 0}`);

    // Additional Info
    addSection("Additional Information");
    addText(`Offer Applicable: ${product.offerApplicable}`);
    addText(`Discount Offered: Rs. ${product.discountOfferedOnProduct || 0}`);
    addText(`In Store: ${product.instore ? "Yes" : "No"}`);
    addText(`CityWitty Assured: ${product.cityWittyAssured ? "Yes" : "No"}`);
    addText(`Wallet Compatible: ${product.isWalletCompatible ? "Yes" : "No"}`);
    addText(`Cashback Points: ${product.cashbackPoints || 0}`);
    addText(`Priority: ${product.isPriority ? "Yes" : "No"}`);
    addText(`Sponsored: ${product.sponsored ? "Yes" : "No"}`);
    addText(`Bestseller Badge: ${product.bestsellerBadge ? "Yes" : "No"}`);
    addText(`Available Stock: ${product.isAvailableStock ? "Yes" : "No"}`);
    if (product.additionalInfo) {
      addText(`Additional Info: ${product.additionalInfo}`);
    }

    // Dimensions
    addSection("Dimensions & Packaging");
    addText(`Height: ${product.productHeight || "N/A"} cm`);
    addText(`Width: ${product.productWidth || "N/A"} cm`);
    addText(`Weight: ${product.productWeight || "N/A"} kg`);
    addText(`Package Height: ${product.productPackageHeight || "N/A"} cm`);
    addText(`Package Width: ${product.productPackageWidth || "N/A"} cm`);
    addText(`Package Weight: ${product.productPackageWeight || "N/A"} kg`);
    if (product.whatsInsideTheBox && product.whatsInsideTheBox.length > 0) {
      addText(`What's Inside the Box: ${product.whatsInsideTheBox.join(", ")}`);
    }

    pdf.save(`${product.name}_details.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-4xl w-full">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2 p-4 rounded-lg bg-blue-50 border-blue-200 border">
            <Package className="h-6 w-6 text-blue-600 bg-blue-100 p-1 rounded-full" />
            <DialogTitle className="text-xl font-bold bg-blue-50 text-blue-600">
              Product Details
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 leading-relaxed">
            Complete information for{" "}
            <strong className="text-black uppercase">{product.name}</strong>
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
                  <strong>Product ID:</strong> {product.id}
                </div>
                <div>
                  <strong>Name:</strong> {product.name}
                </div>
                <div>
                  <strong>Category:</strong> {product.category}
                </div>
                <div>
                  <strong>Merchant:</strong> {product.merchant}
                </div>
                <div className="md:col-span-2">
                  <strong>Description:</strong> {product.description}
                </div>
                <div>
                  <strong>Brand:</strong> {product.brand || "N/A"}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusBadge(product.status)}
                </div>
                <div>
                  <strong>Stock:</strong> {product.stock} units {getStockBadge(product.stock)}
                </div>
                <div>
                  <strong>Price:</strong> Rs. {product.price}
                </div>
                <div>
                  <strong>Discount Price:</strong> Rs. {product.discountPrice}
                </div>
                <div>
                  <strong>Sales:</strong> {product.sales} sold
                </div>
                <div>
                  <strong>Revenue:</strong> Rs. {product.revenue.toFixed(2)}
                </div>
                {product.image && (
                  <div className="md:col-span-2">
                    <strong>Image:</strong>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-32 h-32 object-cover mt-2 rounded"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Accordion for other sections */}
          <Accordion type="single" collapsible className="w-full">
            {/* Variants */}
            {product.productVariants && product.productVariants.length > 0 && (
              <AccordionItem value="variants">
                <AccordionTrigger>Variants ({product.productVariants.length})</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {product.productVariants.map((variant, index) => (
                          <div key={index} className="border p-4 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <strong className="text-gray-700">Variant #{index + 1}</strong>
                              </div>
                              {variant.variantId && (
                                <div>
                                  <strong>ID:</strong> {variant.variantId}
                                </div>
                              )}
                              {variant.name && (
                                <div>
                                  <strong>Name:</strong> {variant.name}
                                </div>
                              )}
                              {variant.price && (
                                <div>
                                  <strong>Price:</strong> Rs. {variant.price}
                                </div>
                              )}
                              {variant.stock && (
                                <div>
                                  <strong>Stock:</strong> {variant.stock} units
                                </div>
                              )}
                              {variant.isAvailableStock !== undefined && (
                                <div>
                                  <strong>Available:</strong>{" "}
                                  <Badge className={variant.isAvailableStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                    {variant.isAvailableStock ? "Yes" : "No"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Product Images */}
            {product.productImages && product.productImages.length > 0 && (
              <AccordionItem value="images">
                <AccordionTrigger>Product Images</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {product.productImages.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Highlights */}
            {product.productHighlights && product.productHighlights.length > 0 && (
              <AccordionItem value="highlights">
                <AccordionTrigger>Highlights</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-4">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {product.productHighlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* FAQ */}
            {product.faq && product.faq.length > 0 && (
              <AccordionItem value="faq">
                <AccordionTrigger>FAQ</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {product.faq.map((faqItem, index) => (
                          <div key={index} className="border p-4 rounded">
                            <div className="font-semibold">Q: {faqItem.question}</div>
                            <div className="mt-2">A: {faqItem.answer}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Warranty & Delivery */}
            <AccordionItem value="warranty-delivery">
              <AccordionTrigger>Warranty & Delivery</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Warranty:</strong>{" "}
                        {product.isWarranty ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      {product.warrantyDescription && (
                        <div className="md:col-span-2">
                          <strong>Warranty Description:</strong> {product.warrantyDescription}
                        </div>
                      )}
                      <div>
                        <strong>Replacement:</strong>{" "}
                        {product.isReplacement ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      {product.replacementDays && (
                        <div>
                          <strong>Replacement Days:</strong> {product.replacementDays}
                        </div>
                      )}
                      <div>
                        <strong>ETA:</strong> {product.eta}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Deliverable Locations:</strong>{" "}
                        {product.deliverableLocations.join(", ")}
                      </div>
                      <div>
                        <strong>Delivery Fee:</strong> Rs. {product.deliveryFee || 0}
                      </div>
                      <div>
                        <strong>Order Handling Fee:</strong> Rs. {product.orderHandlingFee || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Additional Information */}
            <AccordionItem value="additional">
              <AccordionTrigger>Additional Information</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Offer Applicable:</strong> {product.offerApplicable}
                      </div>
                      <div>
                        <strong>Discount Offered:</strong> Rs. {product.discountOfferedOnProduct || 0}
                      </div>
                      <div>
                        <strong>In Store:</strong>{" "}
                        {product.instore ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      <div>
                        <strong>CityWitty Assured:</strong>{" "}
                        {product.cityWittyAssured ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      <div>
                        <strong>Wallet Compatible:</strong>{" "}
                        {product.isWalletCompatible ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      <div>
                        <strong>Cashback Points:</strong> {product.cashbackPoints || 0}
                      </div>
                      <div>
                        <strong>Priority:</strong>{" "}
                        {product.isPriority ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      <div>
                        <strong>Sponsored:</strong>{" "}
                        {product.sponsored ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      <div>
                        <strong>Bestseller Badge:</strong>{" "}
                        {product.bestsellerBadge ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      <div>
                        <strong>Available Stock:</strong>{" "}
                        {product.isAvailableStock ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">No</Badge>
                        )}
                      </div>
                      {product.additionalInfo && (
                        <div className="md:col-span-2">
                          <strong>Additional Info:</strong> {product.additionalInfo}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Dimensions & Packaging */}
            <AccordionItem value="dimensions">
              <AccordionTrigger>Dimensions & Packaging</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Height:</strong> {product.productHeight || "N/A"} cm
                      </div>
                      <div>
                        <strong>Width:</strong> {product.productWidth || "N/A"} cm
                      </div>
                      <div>
                        <strong>Weight:</strong> {product.productWeight || "N/A"} kg
                      </div>
                      <div>
                        <strong>Package Height:</strong> {product.productPackageHeight || "N/A"} cm
                      </div>
                      <div>
                        <strong>Package Width:</strong> {product.productPackageWidth || "N/A"} cm
                      </div>
                      <div>
                        <strong>Package Weight:</strong> {product.productPackageWeight || "N/A"} kg
                      </div>
                      {product.whatsInsideTheBox && product.whatsInsideTheBox.length > 0 && (
                        <div className="md:col-span-2">
                          <strong>What's Inside the Box:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {product.whatsInsideTheBox.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
