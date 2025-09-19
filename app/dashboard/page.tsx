'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Store,
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#4AA8FF', '#FF7A00', '#10B981', '#F59E0B'];

const mockData = {
  stats: {
    totalCards: 12547,
    activeCards: 9823,
    totalMerchants: 456,
    totalFranchises: 89,
    totalRevenue: 245680,
    totalUsers: 15432,
    expiredCards: 2724
  },
  recentMerchants: [
    { id: 1, name: 'Pizza Palace', email: 'contact@pizzapalace.com', status: 'pending', date: '2024-01-15' },
    { id: 2, name: 'Coffee Corner', email: 'info@coffeecorner.com', status: 'approved', date: '2024-01-14' },
    { id: 3, name: 'Book Store', email: 'hello@bookstore.com', status: 'pending', date: '2024-01-13' }
  ],
  recentFeedback: [
    { id: 1, user: 'John Doe', merchant: 'Pizza Palace', rating: 5, comment: 'Excellent service!', date: '2024-01-15' },
    { id: 2, user: 'Jane Smith', merchant: 'Coffee Corner', rating: 4, comment: 'Great coffee, fast service.', date: '2024-01-14' }
  ],
  cardUsageData: [
    { month: 'Jan', active: 8500, inactive: 2000 },
    { month: 'Feb', active: 9200, inactive: 1800 },
    { month: 'Mar', active: 9823, inactive: 1724 }
  ],
  revenueData: [
    { month: 'Oct', revenue: 180000 },
    { month: 'Nov', revenue: 220000 },
    { month: 'Dec', revenue: 245680 }
  ],
  merchantStatusData: [
    { name: 'Active', value: 387, color: '#4AA8FF' },
    { name: 'Pending', value: 45, color: '#FF7A00' },
    { name: 'Inactive', value: 24, color: '#EF4444' }
  ]
};

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleslogout=()=>{

  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold capitalize">Welcome back, {user.username}!</h1>
          <p className="mt-2 opacity-90">Here's what's happening with CityWitty today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.totalCards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.totalMerchants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trends over the last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#4AA8FF" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Merchant Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Merchant Status Distribution</CardTitle>
              <CardDescription>Current status of all merchants</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData.merchantStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockData.merchantStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Notifications and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-[#FF7A00]" />
                Pending Actions
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <div>
                  <p className="font-medium text-red-800">Merchant Registrations</p>
                  <p className="text-sm text-red-600">5 pending approvals</p>
                </div>
                <Badge className="bg-red-100 text-red-800 animate-pulse">5</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div>
                  <p className="font-medium text-orange-800">Franchise Requests</p>
                  <p className="text-sm text-orange-600">2 new applications</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800 animate-pulse">2</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div>
                  <p className="font-medium text-blue-800">Transaction Reviews</p>
                  <p className="text-sm text-blue-600">12 flagged transactions</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 animate-pulse">12</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-[#4AA8FF]" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentMerchants.slice(0, 3).map((merchant) => (
                  <div key={merchant.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#4AA8FF] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{merchant.name} registered</p>
                      <p className="text-xs text-gray-500">{merchant.date}</p>
                    </div>
                    <Badge variant={merchant.status === 'pending' ? 'secondary' : 'default'}>
                      {merchant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Card Usage Trends</CardTitle>
            <CardDescription>Active vs Inactive cards over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.cardUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" stackId="a" fill="#4AA8FF" />
                <Bar dataKey="inactive" stackId="a" fill="#FF7A00" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}