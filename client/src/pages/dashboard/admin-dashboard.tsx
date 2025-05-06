import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PawPrint,
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Search
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { UserRole } from '@shared/schema';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);

  // Fetch users
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/users', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
  });

  // Fetch bookings
  const {
    data: bookings = [],
    isLoading: isLoadingBookings
  } = useQuery({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/bookings', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
    },
  });

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = searchQuery === '' ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterRole === null || user.role === filterRole;

    return matchesSearch && matchesFilter;
  });

  // Handle provider verification
  const handleVerifyProvider = async (userId: number, isVerified: boolean) => {
    try {
      await apiRequest('PATCH', `/api/admin/users/${userId}/verify`, { verified: isVerified });
      toast({
        title: 'Provider updated',
        description: `Provider ${isVerified ? 'verified' : 'unverified'} successfully`,
        variant: 'success',
      });
      refetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update provider verification status',
        variant: 'destructive',
      });
    }
  };

  // Stats for the dashboard
  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      title: 'Clients',
      value: users.filter((user: any) => user.role === UserRole.CLIENT).length,
      icon: <PawPrint className="h-5 w-5 text-primary-500" />,
      color: 'bg-primary-50'
    },
    {
      title: 'Providers',
      value: users.filter((user: any) => user.role === UserRole.PROVIDER).length,
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50'
    },
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50'
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-grow pt-20 pb-20 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-neutral-800">Admin Dashboard</h1>
            <p className="text-neutral-600 mt-2">Manage users, providers, and bookings</p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="providers">Service Providers</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterRole(null)}
                        className={filterRole === null ? 'bg-neutral-100' : ''}
                      >
                        All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterRole(UserRole.CLIENT)}
                        className={filterRole === UserRole.CLIENT ? 'bg-neutral-100' : ''}
                      >
                        Clients
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterRole(UserRole.PROVIDER)}
                        className={filterRole === UserRole.PROVIDER ? 'bg-neutral-100' : ''}
                      >
                        Providers
                      </Button>
                    </div>
                  </div>

                  {isLoadingUsers ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant={user.role === UserRole.ADMIN ? 'destructive' : user.role === UserRole.PROVIDER ? 'outline' : 'secondary'}>
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.isVerified ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-neutral-500">
                                No users found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="providers">
              <Card>
                <CardHeader>
                  <CardTitle>Service Provider Verification</CardTitle>
                  <CardDescription>Verify and manage service providers</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Provider Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.filter((user: any) => user.role === UserRole.PROVIDER).length > 0 ? (
                            users
                              .filter((user: any) => user.role === UserRole.PROVIDER)
                              .map((provider: any) => (
                                <TableRow key={provider.id}>
                                  <TableCell className="font-medium">{provider.fullName}</TableCell>
                                  <TableCell>{provider.email}</TableCell>
                                  <TableCell>{provider.businessInfo?.businessName || 'N/A'}</TableCell>
                                  <TableCell>
                                    {provider.isVerified ? (
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {provider.isVerified ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleVerifyProvider(provider.id, false)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" /> Unverify
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleVerifyProvider(provider.id, true)}
                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" /> Verify
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-neutral-500">
                                No service providers found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>View and manage all bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking: any) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">{booking.serviceName}</TableCell>
                              <TableCell>{booking.clientName}</TableCell>
                              <TableCell>{booking.providerName}</TableCell>
                              <TableCell>{new Date(booking.scheduledDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    booking.status === 'confirmed' ? 'secondary' :
                                    booking.status === 'pending' ? 'outline' :
                                    booking.status === 'cancelled' ? 'destructive' :
                                    'secondary'
                                  }
                                  className={
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''
                                  }
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>${booking.totalPrice}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-neutral-800 mb-2">No Bookings</h3>
                      <p className="text-neutral-600">
                        There are no bookings in the system yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
