import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  CLIENT = "client",
  PROVIDER = "provider",
  ADMIN = "admin",
}

// Business information schema for providers
export const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessDescription: z.string().min(100, "Description must be at least 100 characters").max(500, "Description must be less than 500 characters"),
  businessPhone: z.string().min(1, "Business phone is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  zipCode: z.string().min(1, "ZIP/Postal code is required"),
  birCertificateUrl: z.string().optional(),
  businessPermitUrl: z.string().optional(),
  governmentIdUrl: z.string().optional(),
  documentsSubmitted: z.boolean().default(false),
});

// Define the expected type for business info
export type BusinessInfo = z.infer<typeof businessInfoSchema>;

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").$type<UserRole>().notNull().default(UserRole.CLIENT),
  profileImage: text("profile_image"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  businessInfo: json("business_info").$type<BusinessInfo>(),
  termsAccepted: boolean("terms_accepted").default(false),
});

// Services table schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

// Bookings table schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  status: text("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  notes: text("notes"),
  totalPrice: integer("total_price").notNull(),
});

// Reviews table schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  businessInfo: true,
  isVerified: true,
  fullName: true, // We'll compute this from firstName and lastName
});

// Add combined schema for provider registration form
export const providerRegistrationSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  businessInfo: businessInfoSchema.omit({
    birCertificateUrl: true,
    businessPermitUrl: true,
    governmentIdUrl: true,
    documentsSubmitted: true
  }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  documentUploadConfirmed: z.boolean().refine(val => val === true, {
    message: 'You must confirm that you will submit the required documents'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;

// Service types for front-end display
export const serviceTypes = [
  {
    id: 1,
    name: "Cremation Services",
    description: "Private or communal cremation options with respectful handling of your pet's remains.",
    price: 149,
    imageUrl: "https://images.unsplash.com/photo-1608096299210-db7e38487075?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Memorial Keepsakes",
    description: "Custom urns, paw prints, fur clippings, and personalized memorial items.",
    price: 69,
    imageUrl: "https://images.unsplash.com/photo-1568807942916-85eaddb85858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Farewell Ceremonies",
    description: "Guided memorial services to celebrate your pet's life with family and friends.",
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1583511655826-05700442cea1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Home Euthanasia",
    description: "Compassionate end-of-life care in the comfort of your own home with a licensed vet.",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Garden Memorials",
    description: "Beautiful garden stones, plaques, and plantable memorials to create a living tribute.",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Grief Counseling",
    description: "Supportive counseling sessions to help you navigate the loss of your beloved companion.",
    price: 79,
    imageUrl: "https://images.unsplash.com/photo-1557805058-28eaf9afd318?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  }
];

// Testimonial data
export const testimonials = [
  {
    id: 1,
    text: "PawRest helped us say goodbye to our beloved Max with dignity. The cremation service was respectful, and we received a beautiful personalized urn that now sits on our mantle.",
    rating: 5,
    author: "Sarah M.",
    petName: "Max",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 2,
    text: "Finding a compassionate provider through PawRest made all the difference during our difficult time. The memorial service for our cat Luna was beautiful and healing.",
    rating: 5,
    author: "Robert J.",
    petName: "Luna",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 3,
    text: "The grief counseling services through PawRest helped our family, especially our children, process the loss of our dog Bailey. We're grateful for the support.",
    rating: 4.5,
    author: "Jennifer P.",
    petName: "Bailey",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
  }
];

// FAQ data
export const faqs = [
  {
    id: 1,
    question: "What types of pets do you provide services for?",
    answer: "We provide memorial services for all types of pets, including dogs, cats, birds, rabbits, reptiles, and small animals. Our providers are experienced in handling various species with respect and dignity."
  },
  {
    id: 2,
    question: "How quickly can services be arranged?",
    answer: "Many of our providers offer same-day or next-day services in emergency situations. Standard scheduling is typically available within 2-3 days. You can check real-time availability when booking through our platform."
  },
  {
    id: 3,
    question: "How do I know if a service provider is reputable?",
    answer: "All service providers on PawRest undergo a thorough verification process, including business document verification, government ID checks, and customer reviews. You can view their credentials, certifications, and ratings on their profile pages."
  },
  {
    id: 4,
    question: "What keepsake options are available?",
    answer: "We offer a wide range of keepsake options including custom urns, paw print impressions, fur clippings, memorial jewelry containing ashes, photo frames, and personalized garden stones. Providers may have unique offerings, so be sure to check their specific services."
  },
  {
    id: 5,
    question: "How much do pet memorial services cost?",
    answer: "Service costs vary depending on the type of service, your location, and your specific needs. Basic services start at around $149, while comprehensive packages can range from $299-$599. Each provider lists their specific pricing on their profile."
  }
];
