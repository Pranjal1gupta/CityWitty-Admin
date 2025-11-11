import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Merchant } from "@/app/types/Merchant";
import { useRef } from "react";
import { Download, Users } from "lucide-react";
import MerchantBasicInfoCard from "./MerchantBasicInfoCard";
import MerchantDetailsAccordion from "./MerchantDetailsAccordion";
import generateMerchantPdf from "./generateMerchantPdf";

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
  const contentRef = useRef<HTMLDivElement>(null);

  if (!merchant) return null;

  const handleDownloadPDF = () => {
    generateMerchantPdf(merchant);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-4xl w-full sm:w-full">
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
          <MerchantBasicInfoCard merchant={merchant} />
          <MerchantDetailsAccordion merchant={merchant} />
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
