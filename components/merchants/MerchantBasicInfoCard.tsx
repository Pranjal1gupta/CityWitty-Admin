import { Merchant } from "@/app/types/Merchant";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MerchantBasicInfoCardProps {
  merchant: Merchant;
}

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

const MerchantBasicInfoCard = ({ merchant }: MerchantBasicInfoCardProps) => {
  return (
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
            <strong>Address:</strong> {merchant.streetAddress}, {merchant.locality},{" "}
            {merchant.city}, {merchant.state} {merchant.pincode}, {merchant.country}
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
              <Badge className="bg-green-100 text-green-800">Yes</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">No</Badge>
            )}
          </div>
          <div>
            <strong>Verified:</strong>{" "}
            {merchant.isVerified ? (
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">Not Verified</Badge>
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
            <strong>Suspension Reason:</strong> {merchant.suspensionReason || "N/A"}
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
  );
};

export default MerchantBasicInfoCard;
