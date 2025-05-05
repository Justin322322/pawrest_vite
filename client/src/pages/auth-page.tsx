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
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-2xl font-display font-bold text-primary-600">
              <PawPrint className="mr-2 h-6 w-6" />
              PawRest
            </Link>
          </div>

          {registrationType === 'provider' ? (
            <div>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Register as a Service Provider</h1>
                <p className="text-neutral-600">Join our network of trusted pet memorial service providers</p>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <Form {...providerRegisterForm}>
                    <form 
                      onSubmit={providerRegisterForm.handleSubmit(onProviderRegisterSubmit)} 
                      className="space-y-8"
                    >
                      <Accordion type="single" collapsible defaultValue="personal">
                        {/* Personal Information */}
                        <AccordionItem value="personal">
                          <AccordionTrigger className="text-lg font-medium py-2">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-5 w-5 text-primary-500" />
                              Personal Information
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                                  <FormItem className="col-span-2">
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
                                  <FormItem className="col-span-2">
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
                                    <FormDescription className="text-xs">
                                      Must be at least 8 characters
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
                          <AccordionTrigger className="text-lg font-medium py-2">
                            <div className="flex items-center">
                              <Landmark className="mr-2 h-5 w-5 text-primary-500" />
                              Business Information
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
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
                                        className="min-h-24"
                                      />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      100-500 characters
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <AccordionTrigger className="text-lg font-medium py-2">
                            <div className="flex items-center">
                              <Upload className="mr-2 h-5 w-5 text-primary-500" />
                              Required Documents
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <p className="text-sm text-neutral-600">Please upload the following required documents:</p>
                              
                              <div className="space-y-4">
                                <div className="border rounded-md p-3">
                                  <p className="text-sm font-medium mb-2">BIR Certificate</p>
                                  <Button variant="outline" size="sm" className="w-full" type="button">
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                  </Button>
                                  <p className="text-xs text-neutral-500 mt-1">No file chosen</p>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <p className="text-sm font-medium mb-2">Business Permit</p>
                                  <Button variant="outline" size="sm" className="w-full" type="button">
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                  </Button>
                                  <p className="text-xs text-neutral-500 mt-1">No file chosen</p>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <p className="text-sm font-medium mb-2">Government ID</p>
                                  <Button variant="outline" size="sm" className="w-full" type="button">
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                  </Button>
                                  <p className="text-xs text-neutral-500 mt-1">No file chosen</p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-neutral-600">
                                All documents must be in JPG, JPEG, PNG, or PDF format and less than 5MB in size.
                              </div>
                              
                              {/* Document upload confirmation checkbox */}
                              <FormField
                                control={providerRegisterForm.control}
                                name="documentUploadConfirmed"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm">
                                        I will submit the required verification documents
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
                      <div className="space-y-4">
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
                                <FormLabel className="text-sm">
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
                          {registerMutation.isPending ? 'Submitting...' : 'Register as Provider'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                  <div className="text-center text-sm text-neutral-600">
                    Already have an account? <Link href="/auth" className="text-primary-600 hover:underline">Login</Link>
                  </div>
                  <div className="text-center text-sm text-neutral-600">
                    Looking for pet memorial services?{' '}
                    <button 
                      className="text-primary-600 hover:underline"
                      onClick={() => setRegistrationType('client')}
                    >
                      Register as Pet Parent
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <>
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
                    <CardHeader>
                      <CardTitle>Welcome Back</CardTitle>
                      <CardDescription>
                        Sign in to your account to continue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    <CardFooter className="flex flex-col space-y-4">
                      <div className="text-center text-sm">
                        <a href="#" className="text-primary-600 hover:underline">
                          Forgot your password?
                        </a>
                      </div>
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
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>
                        Join PawRest to access pet memorial services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    <Input placeholder="First name" {...field} />
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
                                    <Input placeholder="Last name" {...field} />
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
                    <CardFooter className="flex justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-center text-sm text-neutral-600">
                          Already have an account?{' '}
                          <button 
                            className="text-primary-600 hover:underline"
                            onClick={() => setActiveTab('login')}
                          >
                            Sign in
                          </button>
                        </div>
                        <div className="text-center text-sm">
                          <button 
                            className="text-primary-600 hover:underline"
                            onClick={() => setRegistrationType('provider')}
                          >
                            Register as Service Provider
                          </button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600">
        <div className="relative flex-1 flex flex-col justify-center p-12 text-white">
          <div className="absolute inset-0 bg-cover bg-center opacity-75" 
               style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')` }}>
          </div>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold font-display mb-6 text-white drop-shadow-lg">Honor their memory with dignity and love</h1>
            <p className="text-lg text-white mb-8 drop-shadow-lg">PawRest connects you with compassionate memorial service providers who understand the special bond you shared with your companion.</p>
            <ul className="space-y-4 text-white drop-shadow">
              <li className="flex items-center">
                <span className="bg-white/30 rounded-full p-1 mr-3">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                Trusted and verified service providers
              </li>
              <li className="flex items-center">
                <span className="bg-white/30 rounded-full p-1 mr-3">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                Personalized memorial services
              </li>
              <li className="flex items-center">
                <span className="bg-white/30 rounded-full p-1 mr-3">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                24/7 compassionate support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
