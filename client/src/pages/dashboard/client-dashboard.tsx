import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PawPrint, Plus, ArrowRight, Loader2 } from 'lucide-react';
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
import { serviceTypes } from '@shared/schema';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services');

  // Fetch data
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    initialData: serviceTypes
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/client/bookings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/client/bookings', {
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
      <Navbar />
      <main className="flex-grow pt-20 pb-20 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-neutral-800">Hello, {user.fullName}</h1>
            <p className="text-neutral-600 mt-2">Manage your pet memorial services and bookings</p>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="services">Available Services</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingServices ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  services?.map((service) => (
                    <Card key={service.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                      <div className="h-48 overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          src={service.imageUrl} 
                          alt={service.name} 
                        />
                      </div>
                      <CardHeader className="p-6 pb-2">
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>From ${service.price}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <p className="text-neutral-600">{service.description}</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Button className="w-full">Book This Service</Button>
                      </CardFooter>
                    </Card>
                  ))
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
                  bookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{booking.serviceName}</CardTitle>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
                        <p className="text-neutral-600">{booking.notes}</p>
                        <p className="text-primary-600 font-medium mt-2">Total: ${booking.totalPrice}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <PawPrint className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-neutral-800 mb-2">No Bookings Yet</h3>
                      <p className="text-neutral-600 mb-6">
                        You haven't booked any memorial services yet.
                      </p>
                      <Button onClick={() => setActiveTab('services')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Book a Service
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>My Profile</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Full Name</h3>
                      <p className="mt-1 text-neutral-800">{user.fullName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                      <p className="mt-1 text-neutral-800">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Username</h3>
                      <p className="mt-1 text-neutral-800">{user.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Phone Number</h3>
                      <p className="mt-1 text-neutral-800">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-neutral-500">Address</h3>
                      <p className="mt-1 text-neutral-800">{user.address || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Edit Profile</Button>
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
