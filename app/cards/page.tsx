"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Users,
  Calendar,
  Search,
  Download,
  Eye,
  ToggleLeft,
  ToggleRight,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface CardData {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: string;
  isCardExist: boolean;
  issueDate: string | null;
  expiryDate: string | null;
  lastUsed: string | null;
  transactions: number;
  savings: number;
  statusReason?: string;

  // Additional fields added
  cardVariantName?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
  country?: string;
  dateOfBirth?: string | null;
  lastLogin?: string | null;
  walletBalance?: number;
  totalPurchases?: number;
  orderHistory?: any[];
  preferences?: Record<string, any>;
  supportTickets?: any[];
}

const initialStats = {
  totalCards: 0,
  activeCards: 0,
  totalUsers: 0,
  expiredCards: 0,
};

export default function CardsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cards, setCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState(initialStats);

  // Modal state
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Toggle dialog state
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [selectedCardForToggle, setSelectedCardForToggle] =
    useState<CardData | null>(null);
  const [statusReason, setStatusReason] = useState("");

  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedCardForEmail, setSelectedCardForEmail] =
    useState<CardData | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchCards() {
      try {
        const res = await fetch("/api/cards");
        if (!res.ok) {
          throw new Error("Failed to fetch cards data");
        }
        const data = await res.json();
        setCards(data.cards || []);
        console.log(data.cards);
        setStats(data.stats || initialStats);
      } catch (error) {
        toast.error("Error loading cards data");
        setCards([]);
        setStats(initialStats);
      }
    }

    fetchCards();

    // Poll every 5 seconds for real-time updates
    intervalId = setInterval(fetchCards, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredCards = cards.filter((card: CardData) => {
    const matchesSearch =
      card.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || card.status === statusFilter;
    console.log(card);

    return matchesSearch && matchesStatus;
  });

  const handleToggleClick = (card: CardData) => {
    setSelectedCardForToggle(card);
    setStatusReason("");
    setShowToggleDialog(true);
  };

  const confirmToggle = async () => {
    if (!selectedCardForToggle) return;
    const newStatus =
      selectedCardForToggle.status === "active" ? "blocked" : "active";

    try {
      const response = await fetch(
        `/api/cards/${selectedCardForToggle.userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            statusReason: newStatus === "blocked" ? statusReason : "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update card status");
      }

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === selectedCardForToggle.id
            ? {
                ...card,
                status: newStatus,
                ...(newStatus === "blocked" && statusReason
                  ? { statusReason }
                  : {}),
              }
            : card
        )
      );
      toast.success(
        `Card ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
      setShowToggleDialog(false);
      setSelectedCardForToggle(null);
      setStatusReason("");
      // Dispatch event to update notification badge in DashboardLayout
      window.dispatchEvent(new CustomEvent("cardStatsUpdated"));
    } catch (error) {
      toast.error("Error updating card status");
    }
  };

  const isCardExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const handleSendEmail = (card: CardData) => {
    setSelectedCardForEmail(card);
    setShowEmailDialog(true);
  };

  const confirmSendEmail = () => {
    if (!selectedCardForEmail) return;
    sendReminderEmail(selectedCardForEmail.email);
    toast.success(`Reminder email sent to ${selectedCardForEmail.email}`);
    setShowEmailDialog(false);
    setSelectedCardForEmail(null);
  };

  const sendReminderEmail = (email: string) => {
    // Dummy function - later replace with actual email sending logic
    console.log(`Sending reminder email to ${email}`);
  };

  const handleExportCards = () => {
    const headers = [
      "Card ID",
      "User Name",
      "Email",
      "Status",
      "Issue Date",
      "Expiry Date",
      "Last Used",
      "Transactions",
      "Total Savings",
    ];

    const csvData = filteredCards.map((card) => [
      card.id || "",
      card.userName,
      card.email,
      card.status,
      card.issueDate || "",
      card.expiryDate || "",
      card.lastUsed || "",
      card.transactions || 0,
      card.savings || 0,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cards.csv";
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "blocked":
        return <Badge className="bg-yellow-100 text-yellow-800">Blocked</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewUser = (card: CardData) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          {/* Left Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Card Management
            </h1>
            <p className="text-gray-600">
              Manage user discount cards and monitor usage
            </p>
          </div>

          {/* Right Section */}
          <Button
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] w-full sm:w-auto"
            onClick={handleExportCards}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Cards
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cards
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCards.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All issued cards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Cards
                </CardTitle>
                <CreditCard className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.activeCards.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Cards
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {cards
                    .filter(
                      (card) => !card.isCardExist && card.status === "pending"
                    )
                    .length.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Blocked Cards
                </CardTitle>
                <CreditCard className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {cards
                    .filter((card) => card.status === "blocked")
                    .length.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently blocked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expired Cards
                </CardTitle>
                <Calendar className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.expiredCards.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Need renewal</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Card Directory</CardTitle>
            <CardDescription>Search and filter user cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or card ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cards Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Savings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {card.id || "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{card.userName}</div>
                          <div className="text-sm text-gray-500">
                            {card.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(card.status || "no-card")}
                      </TableCell>
                      <TableCell>{card.issueDate || "-"}</TableCell>
                      <TableCell>{card.expiryDate || "-"}</TableCell>
                      <TableCell>{card.lastUsed || "-"}</TableCell>
                      <TableCell>{card.transactions || 0}</TableCell>
                      <TableCell>Rs. {card.savings || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(card)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {card.isCardExist && card.status !== "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleClick(card)}
                              disabled={card.status === "expired"}
                            >
                              {card.status === "active" ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          )}
                          {(isCardExpiringSoon(card.expiryDate) ||
                            card.status === "expired") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendEmail(card)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No cards found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Modal */}
      {showModal && selectedCard && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed info for{" "}
                <span className="font-semibold text-blue-600">
                  {selectedCard.userName}
                </span>
              </DialogDescription>
            </DialogHeader>

            {/* Content with scrolling */}
            <div className="space-y-3 text-sm">
              <p>
                <strong>Card ID:</strong>{" "}
                <span className="text-blue-600">{selectedCard.id}</span>
              </p>
              <p>
                <strong>User ID:</strong> {selectedCard.userId}
              </p>
              <p>
                <strong>Name:</strong> {selectedCard.userName}
              </p>
              <p>
                <strong>Email:</strong> {selectedCard.email}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    selectedCard.status === "active"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {selectedCard.status}
                </span>
              </p>
              <p>
                <strong>Card Variant:</strong> {selectedCard.cardVariantName}
              </p>
              <p>
                <strong>Mobile Number:</strong> {selectedCard.mobileNumber}
              </p>
              <p>
                <strong>WhatsApp Number:</strong> {selectedCard.whatsappNumber}
              </p>
              <p>
                <strong>Address:</strong> {selectedCard.address},{" "}
                {selectedCard.city}, {selectedCard.state} -{" "}
                {selectedCard.pincode}, {selectedCard.country}
              </p>
              <p>
                <strong>Date of Birth:</strong> {selectedCard.dateOfBirth}
              </p>
              <p>
                <strong>Last Login:</strong> {selectedCard.lastLogin}
              </p>
              <p>
                <strong>Issue Date:</strong> {selectedCard.issueDate}
              </p>
              <p>
                <strong>Expiry Date:</strong> {selectedCard.expiryDate}
              </p>
              <p>
                <strong>Last Used:</strong> {selectedCard.lastUsed}
              </p>
              <p>
                <strong>Transactions:</strong> {selectedCard.transactions}
              </p>

              {/* Highlight Wallet Balance / Purchases / Savings */}
              <p>
                <strong className="text-indigo-600">Wallet Balance:</strong>{" "}
                <span className="font-semibold text-indigo-600">
                  Rs. {selectedCard.walletBalance}
                </span>
              </p>
              <p>
                <strong className="text-purple-600">Total Purchases:</strong>{" "}
                <span className="font-semibold text-purple-600">
                  Rs. {selectedCard.totalPurchases}
                </span>
              </p>
              <p>
                <strong className="text-green-700">Savings:</strong>{" "}
                <span className="font-semibold text-green-700">
                  Rs. {selectedCard.savings}
                </span>
              </p>

              {selectedCard.statusReason && (
                <p>
                  <strong>Blocked Reason:</strong> {selectedCard.statusReason}
                </p>
              )}

              {/* Order History Section */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-800">
                  Order History
                </h3>
                {!selectedCard.orderHistory ||
                selectedCard.orderHistory.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {selectedCard.orderHistory.map(
                      (order: any, index: number) => (
                        <AccordionItem key={index} value={`order-${index}`}>
                          <AccordionTrigger>
                            Order ID: {order.orderId} -{" "}
                            {order.date
                              ? new Date(order.date).toLocaleDateString()
                              : "-"}{" "}
                            - Rs. {order.amount}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <p>
                                <strong>Status:</strong> {order.status}
                              </p>
                              <p>
                                <strong>Discount Applied:</strong> Rs.{" "}
                                {order.discountApplied}
                              </p>
                              <p>
                                <strong>Savings:</strong> Rs. {order.savings}
                              </p>
                              <p>
                                <strong>Final Amount:</strong> Rs.{" "}
                                {order.finalAmount}
                              </p>
                              <p>
                                <strong>Merchant:</strong> {order.merchant}
                              </p>
                              <p>
                                <strong>Items:</strong>
                              </p>
                              <ul className="list-disc list-inside ml-4">
                                {order.items.map((item: any, idx: number) => (
                                  <li key={idx}>
                                    {item.productName} x {item.quantity} @ Rs.{" "}
                                    {item.price} each (Discount: Rs.{" "}
                                    {item.discount}, Final: Rs.{" "}
                                    {item.finalPrice})
                                  </li>
                                ))}
                              </ul>
                              {order.review && (
                                <div>
                                  <p>
                                    <strong>Review:</strong>
                                  </p>
                                  <p>Rating: {order.review.rating}/5</p>
                                  <p>Comment: {order.review.comment}</p>
                                  {order.review.merchantReply && (
                                    <p>
                                      Merchant Reply:{" "}
                                      {order.review.merchantReply}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Toggle Status Dialog */}
      {showToggleDialog && selectedCardForToggle && (
        <Dialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCardForToggle.status === "active"
                  ? "Deactivate Card"
                  : "Activate Card"}
              </DialogTitle>
              <DialogDescription>
                {selectedCardForToggle.status === "active"
                  ? "Please provide a reason for deactivation."
                  : "Are you sure you want to activate this card?"}
              </DialogDescription>
            </DialogHeader>
            {selectedCardForToggle.status === "active" && (
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason:
                </label>
                <Textarea
                  id="reason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for deactivation"
                />
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowToggleDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmToggle}
                disabled={
                  selectedCardForToggle.status === "active" &&
                  !statusReason.trim()
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Yes, Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Confirmation Dialog */}
      {showEmailDialog && selectedCardForEmail && (
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Reminder Email</DialogTitle>
              <DialogDescription>
                Are you sure you want to send a reminder email to{" "}
                {selectedCardForEmail.userName} ({selectedCardForEmail.email})?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSendEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Yes, Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
