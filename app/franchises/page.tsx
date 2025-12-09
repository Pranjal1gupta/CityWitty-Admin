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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, Store, Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

interface Franchise {
  id: string;
  name: string;
  franchisee: string;
  email: string;
  phone: string;
  status: string;
  registrationDate: string;
  locations: number;
  totalMerchants: number;
  address: string;
  territory: string;
  franchiseFee: number;
  monthlyRevenue: number;
  deactivationReason?: string;
  _id?: string;
}

interface Stats {
  totalFranchises: number;
  activeFranchises: number;
  totalLocations: number;
  pendingApplications: number;
}

export default function FranchisesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalFranchises: 0,
    activeFranchises: 0,
    totalLocations: 0,
    pendingApplications: 0,
  });
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isLoading2, setIsLoading2] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        setIsLoading2(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const response = await fetch(`/api/franchises?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch franchises');
        }

        const data = await response.json();
        setFranchises(data.franchises);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching franchises:', error);
        toast.error('Failed to load franchises');
      } finally {
        setIsLoading2(false);
      }
    };

    if (user) {
      fetchFranchises();
    }
  }, [user, searchTerm, statusFilter]);

  const filteredFranchises = franchises;

  const toggleFranchiseStatus = async (franchiseId: string) => {
    const franchise = franchises.find(f => f.id === franchiseId);
    if (!franchise) return;

    setFranchises(prevFranchises => 
      prevFranchises.map(f => 
        f.id === franchiseId 
          ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' }
          : f
      )
    );
    toast.success('Franchise status updated successfully');
  };

  const deactivateFranchise = () => {
    if (!selectedFranchise || !deactivationReason.trim()) {
      toast.error('Please provide a reason for deactivation');
      return;
    }

    setFranchises(prevFranchises => 
      prevFranchises.map(franchise => 
        franchise.id === selectedFranchise.id 
          ? { ...franchise, status: 'inactive', deactivationReason }
          : franchise
      )
    );
    
    setIsDeactivateDialogOpen(false);
    setDeactivationReason('');
    setSelectedFranchise(null);
    toast.success('Franchise deactivated successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  }

  if (!user) return null;

  if (isLoading2) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Franchise Management</h1>
            <p className="text-gray-600">Manage franchise operations and locations</p>
          </div>
          <Badge className="bg-[#FF7A00] text-white animate-pulse">
            {stats.pendingApplications} Pending Applications
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Franchises</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFranchises.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Franchises</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeFranchises.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Currently operating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLocations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all franchises</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Store className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Franchises Table */}
        <Card>
          <CardHeader>
            <CardTitle>Franchise Directory</CardTitle>
            <CardDescription>Manage all franchise operations and territories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, franchisee, or email..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franchise</TableHead>
                    <TableHead>Franchisee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Merchants</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFranchises.map((franchise) => (
                    <TableRow key={franchise.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{franchise.name}</div>
                          <div className="text-sm text-gray-500">{franchise.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{franchise.franchisee}</div>
                          <div className="text-sm text-gray-500">{franchise.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(franchise.status)}</TableCell>
                      <TableCell>{franchise.territory}</TableCell>
                      <TableCell>{franchise.locations}</TableCell>
                      <TableCell>{franchise.totalMerchants}</TableCell>
                      <TableCell>${franchise.monthlyRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {franchise.status !== 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (franchise.status === 'active') {
                                  setSelectedFranchise(franchise);
                                  setIsDeactivateDialogOpen(true);
                                } else {
                                  toggleFranchiseStatus(franchise.id);
                                }
                              }}
                            >
                              {franchise.status === 'active' ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFranchises.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No franchises found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deactivation Dialog */}
        <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate Franchise</DialogTitle>
              <DialogDescription>
                Please provide a reason for deactivating {selectedFranchise?.name}. This action will affect all associated merchants and locations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for deactivation..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={deactivateFranchise}
                className="bg-red-600 hover:bg-red-700"
                disabled={!deactivationReason.trim()}
              >
                Deactivate Franchise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}