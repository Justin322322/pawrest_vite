import { mysqlTable, text, int, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { UserRole, BusinessInfo } from "./schema";

// Users table schema
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default(UserRole.CLIENT),
  profileImage: text("profile_image"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  businessInfo: json("business_info").$type<BusinessInfo>(),
  termsAccepted: boolean("terms_accepted").default(false),
});

// Services table schema
export const services = mysqlTable("services", {
  id: int("id").primaryKey().autoincrement(),
  providerId: int("provider_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  duration: int("duration").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

// Bookings table schema
export const bookings = mysqlTable("bookings", {
  id: int("id").primaryKey().autoincrement(),
  clientId: int("client_id").notNull().references(() => users.id),
  providerId: int("provider_id").notNull().references(() => users.id),
  serviceId: int("service_id").notNull().references(() => services.id),
  status: text("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  notes: text("notes"),
  totalPrice: int("total_price").notNull(),
});

// Reviews table schema
export const reviews = mysqlTable("reviews", {
  id: int("id").primaryKey().autoincrement(),
  bookingId: int("booking_id").notNull().references(() => bookings.id),
  clientId: int("client_id").notNull().references(() => users.id),
  providerId: int("provider_id").notNull().references(() => users.id),
  rating: int("rating").notNull(),
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
