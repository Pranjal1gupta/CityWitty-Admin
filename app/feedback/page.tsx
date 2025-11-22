'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Star, TrendingUp, Users, Search, Download, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

const mockFeedbackData = [
  {
    id: 'FB001',
    userId: 'USR001',
    userName: 'John Doe',
    userEmail: 'john.doe@email.com',
    merchantId: 'MER001',
    merchantName: 'Pizza Palace',
    rating: 5,
    category: 'service',
    subject: 'Excellent Service',
    comment: 'The pizza was amazing and the service was exceptional. The discount card made it even better!',
    date: '2024-01-15 14:30:25',
    status: 'new'
  },
  {
    id: 'FB002',
    userId: 'USR002',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@email.com',
    merchantId: 'MER002',
    merchantName: 'Coffee Corner',
    rating: 4,
    category: 'product',
    subject: 'Great Coffee',
    comment: 'Love the coffee quality. The discount card savings are fantastic!',
    date: '2024-01-14 10:15:42',
    status: 'reviewed'
  },
  {
    id: 'FB003',
    userId: 'USR003',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@email.com',
    merchantId: 'MER003',
    merchantName: 'Book Store',
    rating: 3,
    category: 'app',
    subject: 'App Issues',
    comment: 'The app sometimes crashes when trying to apply discounts. Please fix this.',
    date: '2024-01-13 16:45:18',
    status: 'new'
  },
  {
    id: 'FB004',
    userId: 'USR004',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@email.com',
    merchantId: 'MER004',
    merchantName: 'Fashion Boutique',
    rating: 5,
    category: 'service',
    subject: 'Outstanding Experience',
    comment: 'Perfect shopping experience with great discounts. Highly recommend!',
    date: '2024-01-12 11:22:33',
    status: 'archived'
  },
  {
    id: 'FB005',
    userId: 'USR005',
    userName: 'David Brown',
    userEmail: 'david.brown@email.com',
    merchantId: null,
    merchantName: 'General',
    rating: 2,
    category: 'general',
    subject: 'Card Activation Issues',
    comment: 'Had trouble activating my discount card. Customer service was slow to respond.',
    date: '2024-01-11 09:15:28',
    status: 'new'
  }
];

const mockStats = {
  totalFeedback: 1234,
  averageRating: 4.2,
  newFeedback: 45,
  responseRate: 87.5
};

export default function FeedbackPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState(mockFeedbackData);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesRating = ratingFilter === 'all' || item.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesRating;
  });

  const viewFeedback = (feedbackItem: any) => {
    setSelectedFeedback(feedbackItem);
    setIsViewDialogOpen(true);
    
    // Mark as reviewed if it was new
    if (feedbackItem.status === 'new') {
      setFeedback(prev => 
        prev.map(item => 
          item.id === feedbackItem.id 
            ? { ...item, status: 'reviewed' }
            : item
        )
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 animate-pulse">New</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      service: 'bg-purple-100 text-purple-800',
      product: 'bg-orange-100 text-orange-800',
      app: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const exportFeedback = () => {
    toast.success('Feedback data exported successfully');
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Feedback & Reviews</h1>
            <p className="text-gray-600">Monitor user responses and improve platform experience</p>
          </div>
          <div className="flex space-x-2">
            <Badge className="bg-[#FF7A00] text-white animate-pulse">
              3 New Feedback
            </Badge>
            <Button onClick={exportFeedback} className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00]">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalFeedback.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {mockStats.averageRating}
                <Star className="w-6 h-6 ml-1 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockStats.newFeedback.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockStats.responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Management</CardTitle>
            <CardDescription>Review and manage all user feedback submissions</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user, merchant, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.userName}</div>
                          <div className="text-sm text-gray-500">{item.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.merchantName}</TableCell>
                      <TableCell>{renderStars(item.rating)}</TableCell>
                      <TableCell>{getCategoryBadge(item.category)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{item.subject}</div>
                          <div className="text-sm text-gray-500 truncate">{item.comment}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.date}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewFeedback(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFeedback.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No feedback found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Feedback Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>
                Review complete feedback submission
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">User Information</h4>
                    <p className="text-sm">{selectedFeedback.userName}</p>
                    <p className="text-sm text-gray-500">{selectedFeedback.userEmail}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Merchant</h4>
                    <p className="text-sm">{selectedFeedback.merchantName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Rating</h4>
                    {renderStars(selectedFeedback.rating)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Category</h4>
                    {getCategoryBadge(selectedFeedback.category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Status</h4>
                    {getStatusBadge(selectedFeedback.status)}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Subject</h4>
                  <p className="text-sm">{selectedFeedback.subject}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Comment</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedFeedback.comment}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Submission Date</h4>
                  <p className="text-sm text-gray-500">{selectedFeedback.date}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}