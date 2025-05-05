import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect } from 'wouter';
import { PawPrint, Upload, Check, Info, FileText, CreditCard, Landmark } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { 
  UserRole, 
  businessInfoSchema, 
  providerRegistrationSchema
} from '@shared/schema';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'wouter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Client registration schema
const clientRegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  email: z.string().email('Invalid email address'),
  role: z.enum([UserRole.CLIENT]),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
type LoginFormValues = z.infer<typeof loginSchema>;
type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>;
type ProviderRegisterFormValues = z.infer<typeof providerRegistrationSchema>;

// Constants for the provinces
const philippineProvinces = [
  "Bataan", "Bulacan", "Cavite", "Laguna", "Metro Manila", "Pampanga", "Rizal"
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [registrationType, setRegistrationType] = useState<'client' | 'provider'>('client');
  const { user, loginMutation, registerMutation } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Client registration form
  const clientRegisterForm = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      role: UserRole.CLIENT,
      phoneNumber: '',
      address: '',
      termsAccepted: false,
    },
  });

  // Provider registration form
  const providerRegisterForm = useForm<ProviderRegisterFormValues>({
    resolver: zodResolver(providerRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      role: UserRole.PROVIDER,
      termsAccepted: false,
      documentUploadConfirmed: false,
      businessInfo: {
        businessName: '',
        businessDescription: '',
        businessPhone: '',
        businessAddress: '',
        city: '',
        province: 'Bataan',
        zipCode: '',
      }
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onClientRegisterSubmit = (data: ClientRegisterFormValues) => {
    // Transform data for the API
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.CLIENT,
      phoneNumber: data.phoneNumber,
      address: data.address,
      termsAccepted: data.termsAccepted,
    });
  };

  const onProviderRegisterSubmit = (data: ProviderRegisterFormValues) => {
    // Transform data for the API
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.PROVIDER,
      phoneNumber: data.businessInfo.businessPhone,
      address: data.businessInfo.businessAddress,
      termsAccepted: data.termsAccepted,
      businessInfo: data.businessInfo,
    });
  };

  // If already logged in, redirect to dashboard
  if (user) {
    if (user.role === UserRole.CLIENT) {
      return <Redirect to="/dashboard/client" />;
    } else if (user.role === UserRole.PROVIDER) {
      return <Redirect to="/dashboard/provider" />;
    } else if (user.role === UserRole.ADMIN) {
      return <Redirect to="/dashboard/admin" />;
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with logo */}
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto">
          <Link href="/" className="inline-flex items-center text-xl font-display font-bold text-primary-600">
            <PawPrint className="mr-2 h-5 w-5" />
            PawRest
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {registrationType === 'provider' ? (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-800">Register as a Service Provider</h1>
                <p className="text-neutral-600 mt-1">Join our network of trusted pet memorial service providers in the Philippines. Complete the form below to apply.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setRegistrationType('client')}
                className="flex-shrink-0"
              >
                Register as Pet Parent
              </Button>
            </div>
            
            <Card className="border-t-4 border-t-primary-500">
              <CardContent className="pt-6">
                <Form {...providerRegisterForm}>
                  <form 
                    onSubmit={providerRegisterForm.handleSubmit(onProviderRegisterSubmit)} 
                    className="space-y-8"
                  >
                    <Accordion type="single" collapsible defaultValue="personal">
                      {/* Personal Information */}
                      <AccordionItem value="personal">
                        <AccordionTrigger className="text-lg font-medium py-4">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-primary-500" />
                            Personal Information
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <FormField
                              control={providerRegisterForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerRegisterForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerRegisterForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your.email@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerRegisterForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Choose a username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerRegisterForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Create a secure password" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Password must be at least 8 characters long
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerRegisterForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Confirm your password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {/* Business Information */}
                      <AccordionItem value="business">
                        <AccordionTrigger className="text-lg font-medium py-4">
                          <div className="flex items-center">
                            <Landmark className="mr-2 h-5 w-5 text-primary-500" />
                            Business Information
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-4">
                            <FormField
                              control={providerRegisterForm.control}
                              name="businessInfo.businessName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your business name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={providerRegisterForm.control}
                              name="businessInfo.businessDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your pet memorial services and experience" 
                                      {...field} 
                                      className="min-h-32"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Describe your pet memorial services and experience (100-500 characters)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={providerRegisterForm.control}
                                name="businessInfo.businessPhone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Business Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+63 XXX XXX XXXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={providerRegisterForm.control}
                                name="businessInfo.businessAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Business Address</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Street address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={providerRegisterForm.control}
                                name="businessInfo.city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={providerRegisterForm.control}
                                name="businessInfo.province"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Province</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select province" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {philippineProvinces.map((province) => (
                                          <SelectItem key={province} value={province}>
                                            {province}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={providerRegisterForm.control}
                                name="businessInfo.zipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP/Postal Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="ZIP/Postal code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {/* Required Documents */}
                      <AccordionItem value="documents">
                        <AccordionTrigger className="text-lg font-medium py-4">
                          <div className="flex items-center">
                            <Upload className="mr-2 h-5 w-5 text-primary-500" />
                            Required Documents
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-4">
                            <p className="text-neutral-600">Please upload the following required documents to complete your registration:</p>
                            
                            <div className="space-y-6">
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium text-neutral-800 flex items-center">
                                      <CreditCard className="h-4 w-4 mr-2 text-primary-500" />
                                      BIR Certificate
                                    </h4>
                                    <p className="text-sm text-neutral-600">Bureau of Internal Revenue (BIR) Certificate of Registration</p>
                                  </div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-neutral-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">Valid BIR Certificate is required to verify your business status</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className="mt-2">
                                  <Button variant="outline" className="w-full" type="button">
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                  </Button>
                                  <p className="text-xs text-neutral-500 mt-2">No file chosen</p>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium text-neutral-800 flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-primary-500" />
                                      Business Permit
                                    </h4>
                                    <p className="text-sm text-neutral-600">Local government-issued Business Permit</p>
                                  </div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-neutral-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">Valid Business Permit confirms your authorization to operate</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className="mt-2">
                                  <Button variant="outline" className="w-full" type="button">
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                  </Button>
                                  <p className="text-xs text-neutral-500 mt-2">No file chosen</p>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium text-neutral-800 flex items-center">
                                      <CreditCard className="h-4 w-4 mr-2 text-primary-500" />
                                      Government ID
                                    </h4>
                                    <p className="text-sm text-neutral-600">Valid government-issued ID (e.g., Passport, Driver's License, UMID)</p>
                                  </div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-neutral-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">Personal identification is required to verify your identity</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className="mt-2">
                                  <Button variant="outline" className="w-full" type="button">
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                  </Button>
                                  <p className="text-xs text-neutral-500 mt-2">No file chosen</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-neutral-600">
                              All documents must be in JPG, JPEG, PNG, or PDF format and less than 5MB in size.
                            </div>
                            
                            {/* Document upload confirmation checkbox */}
                            <FormField
                              control={providerRegisterForm.control}
                              name="documentUploadConfirmed"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      I understand that I will need to submit the required business verification documents after registration
                                    </FormLabel>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Terms and Conditions */}
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <h3 className="font-medium text-lg mb-4">Terms and Conditions</h3>
                        <FormField
                          control={providerRegisterForm.control}
                          name="termsAccepted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I agree to the <Link href="#" className="text-primary-600 hover:underline">Terms and Conditions</Link> and <Link href="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex flex-col space-y-4">
                        <Button 
                          type="submit" 
                          size="lg"
                          className="bg-primary-600 hover:bg-primary-700"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? 'Submitting...' : 'Register as Provider'}
                        </Button>
                        
                        <div className="text-center text-sm text-neutral-600">
                          Already have a provider account? <Link href="/auth" className="text-primary-600 hover:underline">Login</Link>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="mt-8 text-center">
              <p className="text-neutral-600 mb-2">Looking for pet memorial services?</p>
              <Button variant="outline" onClick={() => setRegistrationType('client')}>
                Register as Pet Parent
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Login/Register Form */}
            <div className="p-2">
              <div className="mb-8">
                {activeTab === 'login' ? (
                  <>
                    <h1 className="text-3xl font-display font-bold text-neutral-800">Welcome Back</h1>
                    <p className="text-neutral-600 mt-1">Sign in to access your PawRest account</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-display font-bold text-neutral-800">Create an Account</h1>
                    <p className="text-neutral-600 mt-1">Join PawRest as a pet parent</p>
                  </>
                )}
              </div>
              
              <Tabs 
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card>
                    <CardContent className="pt-6">
                      <Form {...loginForm}>
                        <form 
                          onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                          className="space-y-4"
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your username" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="text-right">
                            <Link href="#" className="text-sm text-primary-600 hover:underline">
                              Forgot your password?
                            </Link>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 border-t pt-4">
                      <div className="text-center text-sm text-neutral-600">
                        Don't have an account?{' '}
                        <button 
                          className="text-primary-600 hover:underline"
                          onClick={() => setActiveTab('register')}
                        >
                          Sign up
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="register">
                  <Card>
                    <CardContent className="pt-6">
                      <Form {...clientRegisterForm}>
                        <form 
                          onSubmit={clientRegisterForm.handleSubmit(onClientRegisterSubmit)} 
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={clientRegisterForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={clientRegisterForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={clientRegisterForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={clientRegisterForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Choose a username" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={clientRegisterForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="Create a password" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={clientRegisterForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="Confirm password" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={clientRegisterForm.control}
                            name="termsAccepted"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <Link href="#" className="text-primary-600 hover:underline">Terms and Conditions</Link> and <Link href="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-center text-sm text-neutral-600">
                        Already have an account?{' '}
                        <button 
                          className="text-primary-600 hover:underline"
                          onClick={() => setActiveTab('login')}
                        >
                          Sign in
                        </button>
                      </div>
                      <div className="text-center text-sm text-neutral-600">
                        <button 
                          className="text-primary-600 hover:underline"
                          onClick={() => setRegistrationType('provider')}
                        >
                          Register as Provider
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Information Card */}
            <div className="hidden md:block p-2">
              <div className="bg-primary-50 rounded-xl p-8 h-full">
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-display font-bold text-primary-800 mb-6">Honor their memory with dignity and love</h2>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 bg-primary-100 p-2 rounded-full text-primary-700">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary-900">Trusted Service Providers</h3>
                        <p className="text-primary-800/80">Verified memorial service professionals dedicated to compassionate care</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 bg-primary-100 p-2 rounded-full text-primary-700">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary-900">Personalized Services</h3>
                        <p className="text-primary-800/80">Customized memorial options to celebrate your pet's unique personality</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 bg-primary-100 p-2 rounded-full text-primary-700">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary-900">Supportive Community</h3>
                        <p className="text-primary-800/80">Join a caring network of pet parents who understand your journey</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="border-t border-primary-200 pt-6">
                      <blockquote className="italic text-primary-800/90">
                        "Our companions leave paw prints on our hearts. Honor their memory with the dignified farewell they deserve."
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
