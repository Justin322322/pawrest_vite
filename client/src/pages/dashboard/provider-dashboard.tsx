import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PawPrint,
  Plus,
  ArrowRight,
  Loader2,
  Calendar,
  Users,
  DollarSign,
  PieChart
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch provider services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/provider/services'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/provider/services', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch services');
        }
        return await res.json();
      } catch (error) {
        return [];
      }
    },
    initialData: [],
  });

  // Fetch provider bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/provider/bookings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/provider/bookings', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        return await res.json();
      } catch (error) {
        return [];
      }
    },
    initialData: [],
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Stats for the overview tab
  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: <Calendar className="h-5 w-5 text-primary-500" />,
      color: 'bg-primary-50'
    },
    {
      title: 'Total Clients',
      value: [...new Set(bookings.map((booking: any) => booking.clientId))].length,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      title: 'Active Services',
      value: services.filter((service: any) => service.isActive).length,
      icon: <PawPrint className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: `$${bookings.reduce((sum: number, booking: any) => sum + booking.totalPrice, 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50'
    }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-grow pt-20 pb-20 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-800">Provider Dashboard</h1>
              <p className="text-neutral-600 mt-2">
                Welcome back, {user.fullName} {user.isVerified ? '(Verified)' : '(Pending Verification)'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Service
              </Button>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">My Services</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="business">Business Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
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

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest service requests from clients</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6">
                    {isLoadingBookings ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                      </div>
                    ) : bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking: any) => (
                          <div key={booking.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                            <div>
                              <p className="font-medium">{booking.serviceId}</p>
                              <p className="text-sm text-neutral-500">
                                {new Date(booking.scheduledDate).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-600">No bookings yet</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab('bookings')}>
                      View All Bookings
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>Service performance and revenue</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center py-10">
                      <div className="text-center">
                        <PieChart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-600">Detailed analytics will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingServices ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : services.length > 0 ? (
                  services.map((service: any) => (
                    <Card key={service.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                      <div className="h-48 overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src={service.imageUrl || 'https://images.unsplash.com/photo-1608096299210-db7e38487075?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                          alt={service.name}
                        />
                      </div>
                      <CardHeader className="p-6 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{service.name}</CardTitle>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <CardDescription>${service.price}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <p className="text-neutral-600">{service.description}</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex justify-between">
                        <Button variant="outline">Edit</Button>
                        <Button variant="destructive" className="bg-red-500">Disable</Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center">
                      <PawPrint className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-neutral-800 mb-2">No Services Added Yet</h3>
                      <p className="text-neutral-600 mb-6">
                        Add your first memorial service to start receiving bookings.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Service
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <div className="space-y-6">
                {isLoadingBookings ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : bookings.length > 0 ? (
                  bookings.map((booking: any) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Booking #{booking.id}</CardTitle>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <CardDescription>
                          Scheduled for {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-neutral-500">Client</p>
                            <p className="text-neutral-800">Client #{booking.clientId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-500">Service</p>
                            <p className="text-neutral-800">Service #{booking.serviceId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-500">Notes</p>
                            <p className="text-neutral-600">{booking.notes || 'No notes provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-500">Total</p>
                            <p className="text-primary-600 font-medium">${booking.totalPrice}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button variant="outline" className="flex-1">View Details</Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button className="flex-1 bg-green-600 hover:bg-green-700">Accept</Button>
                            <Button variant="destructive" className="flex-1">Decline</Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-neutral-800 mb-2">No Bookings Yet</h3>
                      <p className="text-neutral-600 mb-6">
                        You haven't received any service bookings yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Calendar</CardTitle>
                  <CardDescription>Manage when you're available to provide services</CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="flex items-center justify-center py-10">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-600">Calendar integration coming soon</p>
                      <p className="text-sm text-neutral-500 mt-2">Set your availability to help clients book appointments at convenient times</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>Manage your business information and verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Business Name</h3>
                      <p className="mt-1 text-neutral-800">{user.fullName}'s Pet Memorial Services</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                      <p className="mt-1 text-neutral-800">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Phone</h3>
                      <p className="mt-1 text-neutral-800">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Verification Status</h3>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {user.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-neutral-500">Business Address</h3>
                      <p className="mt-1 text-neutral-800">{user.address || 'Not provided'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-neutral-500">Document Verification</h3>
                      {user.isVerified ? (
                        <p className="mt-1 text-green-600">All documents have been verified</p>
                      ) : (
                        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-yellow-800">
                            Please submit the following documents for verification:
                          </p>
                          <ul className="list-disc pl-5 mt-2 text-yellow-700 text-sm">
                            <li>Business registration certificate</li>
                            <li>Government-issued ID</li>
                            <li>Proof of address</li>
                          </ul>
                          <Button className="mt-4">Upload Documents</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Edit Business Profile</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
