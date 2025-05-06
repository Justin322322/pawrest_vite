import { UserRole } from "@shared/schema";
import type {
  User, Service, Booking, Review,
  InsertUser, BusinessInfo
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { pool } from "./db";

// Define missing types
interface InsertService {
  providerId: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

// Extend Booking type to include createdAt
interface ExtendedBooking extends Booking {
  createdAt: Date;
}

interface InsertBooking {
  clientId: number;
  providerId: number;
  serviceId: number;
  status?: string;
  scheduledDate: Date;
  notes?: string | null;
  totalPrice: number;
}

interface InsertReview {
  bookingId: number;
  clientId: number;
  providerId: number;
  rating: number;
  comment?: string | null;
}

// Create memory store
const MemoryStore = createMemoryStore(session);

// Define the SessionStore type
type SessionStore = session.Store;

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  verifyProvider(id: number): Promise<User>;

  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServicesByProviderId(providerId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByClientId(clientId: number): Promise<Booking[]>;
  getBookingsByProviderId(providerId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;

  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByProviderId(providerId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Session store
  sessionStore: SessionStore;
}

// MySQL Storage Implementation
export class MySQLStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    try {
      // Try to use memory store for sessions
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
      console.log('Using memory session store');
    } catch (error) {
      console.error('Failed to create session store:', error);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      const users = rows as any[];
      if (users.length === 0) return undefined;

      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: user.role as UserRole,
        profileImage: user.profile_image,
        phoneNumber: user.phone_number,
        address: user.address,
        isVerified: Boolean(user.is_verified),
        businessInfo: user.business_info ? JSON.parse(user.business_info) : null,
        termsAccepted: Boolean(user.terms_accepted)
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      const users = rows as any[];
      if (users.length === 0) return undefined;

      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: user.role as UserRole,
        profileImage: user.profile_image,
        phoneNumber: user.phone_number,
        address: user.address,
        isVerified: Boolean(user.is_verified),
        businessInfo: user.business_info ? JSON.parse(user.business_info) : null,
        termsAccepted: Boolean(user.terms_accepted)
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const users = rows as any[];
      if (users.length === 0) return undefined;

      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: user.role as UserRole,
        profileImage: user.profile_image,
        phoneNumber: user.phone_number,
        address: user.address,
        isVerified: Boolean(user.is_verified),
        businessInfo: user.business_info ? JSON.parse(user.business_info) : null,
        termsAccepted: Boolean(user.terms_accepted)
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Generate full name
      const fullName = `${insertUser.firstName} ${insertUser.lastName}`;

      // Handle business info
      let businessInfo = null;
      if ('businessInfo' in insertUser && insertUser.businessInfo) {
        businessInfo = JSON.stringify(insertUser.businessInfo);
      }

      // Set default isVerified based on role
      const isVerified = insertUser.role === 'admin' ? true : false;

      const [result] = await pool.execute(
        `INSERT INTO users
        (username, password, email, first_name, last_name, full_name, role,
         profile_image, phone_number, address, is_verified, business_info, terms_accepted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          insertUser.username,
          insertUser.password,
          insertUser.email,
          insertUser.firstName,
          insertUser.lastName,
          fullName,
          insertUser.role,
          insertUser.profileImage || null,
          insertUser.phoneNumber || null,
          insertUser.address || null,
          isVerified,
          businessInfo,
          insertUser.termsAccepted || false
        ]
      );

      const insertId = (result as any).insertId;

      return {
        id: insertId,
        username: insertUser.username,
        password: insertUser.password,
        email: insertUser.email,
        firstName: insertUser.firstName,
        lastName: insertUser.lastName,
        fullName,
        role: insertUser.role as UserRole,
        profileImage: insertUser.profileImage || null,
        phoneNumber: insertUser.phoneNumber || null,
        address: insertUser.address || null,
        isVerified: isVerified,
        businessInfo: null,
        termsAccepted: insertUser.termsAccepted || false
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const [rows] = await pool.execute('SELECT * FROM users');

      return (rows as any[]).map(user => ({
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: user.role as UserRole,
        profileImage: user.profile_image,
        phoneNumber: user.phone_number,
        address: user.address,
        isVerified: Boolean(user.is_verified),
        businessInfo: user.business_info ? JSON.parse(user.business_info) : null,
        termsAccepted: Boolean(user.terms_accepted)
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async verifyProvider(id: number): Promise<User> {
    try {
      await pool.execute(
        'UPDATE users SET is_verified = TRUE WHERE id = ?',
        [id]
      );

      const user = await this.getUser(id);
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error('Error verifying provider:', error);
      throw error;
    }
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );

      const services = rows as any[];
      if (services.length === 0) return undefined;

      const service = services[0];
      return {
        id: service.id,
        providerId: service.provider_id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        imageUrl: service.image_url,
        isActive: Boolean(service.is_active)
      };
    } catch (error) {
      console.error('Error getting service:', error);
      return undefined;
    }
  }

  async getServicesByProviderId(providerId: number): Promise<Service[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM services WHERE provider_id = ?',
        [providerId]
      );

      return (rows as any[]).map(service => ({
        id: service.id,
        providerId: service.provider_id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        imageUrl: service.image_url,
        isActive: Boolean(service.is_active)
      }));
    } catch (error) {
      console.error('Error getting services by provider ID:', error);
      return [];
    }
  }

  async createService(insertService: InsertService): Promise<Service> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO services
        (provider_id, name, description, price, duration, image_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          insertService.providerId,
          insertService.name,
          insertService.description,
          insertService.price,
          insertService.duration,
          insertService.imageUrl || null,
          insertService.isActive !== undefined ? insertService.isActive : true
        ]
      );

      const insertId = (result as any).insertId;

      return {
        id: insertId,
        providerId: insertService.providerId,
        name: insertService.name,
        description: insertService.description,
        price: insertService.price,
        duration: insertService.duration,
        imageUrl: insertService.imageUrl || null,
        isActive: insertService.isActive !== undefined ? insertService.isActive : true
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    try {
      const currentService = await this.getService(id);
      if (!currentService) {
        throw new Error("Service not found");
      }

      const updateFields = [];
      const updateValues = [];

      if (service.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(service.name);
      }

      if (service.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(service.description);
      }

      if (service.price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(service.price);
      }

      if (service.duration !== undefined) {
        updateFields.push('duration = ?');
        updateValues.push(service.duration);
      }

      if (service.imageUrl !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(service.imageUrl);
      }

      if (service.isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(service.isActive);
      }

      if (updateFields.length === 0) {
        return currentService;
      }

      updateValues.push(id);

      await pool.execute(
        `UPDATE services SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return {
        ...currentService,
        ...service
      };
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bookings WHERE id = ?',
        [id]
      );

      const bookings = rows as any[];
      if (bookings.length === 0) return undefined;

      const booking = bookings[0];
      return {
        id: booking.id,
        clientId: booking.client_id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        status: booking.status,
        scheduledDate: new Date(booking.scheduled_date),
        notes: booking.notes,
        totalPrice: booking.total_price
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      return undefined;
    }
  }

  async getBookingsByClientId(clientId: number): Promise<Booking[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bookings WHERE client_id = ?',
        [clientId]
      );

      return (rows as any[]).map(booking => ({
        id: booking.id,
        clientId: booking.client_id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        status: booking.status,
        scheduledDate: new Date(booking.scheduled_date),
        notes: booking.notes,
        totalPrice: booking.total_price
      }));
    } catch (error) {
      console.error('Error getting bookings by client ID:', error);
      return [];
    }
  }

  async getBookingsByProviderId(providerId: number): Promise<Booking[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bookings WHERE provider_id = ?',
        [providerId]
      );

      return (rows as any[]).map(booking => ({
        id: booking.id,
        clientId: booking.client_id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        status: booking.status,
        scheduledDate: new Date(booking.scheduled_date),
        notes: booking.notes,
        totalPrice: booking.total_price
      }));
    } catch (error) {
      console.error('Error getting bookings by provider ID:', error);
      return [];
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO bookings
        (client_id, provider_id, service_id, status, scheduled_date, notes, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          insertBooking.clientId,
          insertBooking.providerId,
          insertBooking.serviceId,
          insertBooking.status || 'pending',
          insertBooking.scheduledDate,
          insertBooking.notes || null,
          insertBooking.totalPrice
        ]
      );

      const insertId = (result as any).insertId;

      return {
        id: insertId,
        clientId: insertBooking.clientId,
        providerId: insertBooking.providerId,
        serviceId: insertBooking.serviceId,
        status: insertBooking.status || 'pending',
        scheduledDate: insertBooking.scheduledDate,
        notes: insertBooking.notes || null,
        totalPrice: insertBooking.totalPrice
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    try {
      await pool.execute(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );

      const booking = await this.getBooking(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      const [rows] = await pool.execute('SELECT * FROM bookings');

      return (rows as any[]).map(booking => ({
        id: booking.id,
        clientId: booking.client_id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        status: booking.status,
        scheduledDate: new Date(booking.scheduled_date),
        notes: booking.notes,
        totalPrice: booking.total_price
      }));
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM reviews WHERE id = ?',
        [id]
      );

      const reviews = rows as any[];
      if (reviews.length === 0) return undefined;

      const review = reviews[0];
      return {
        id: review.id,
        bookingId: review.booking_id,
        clientId: review.client_id,
        providerId: review.provider_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.created_at)
      };
    } catch (error) {
      console.error('Error getting review:', error);
      return undefined;
    }
  }

  async getReviewsByProviderId(providerId: number): Promise<Review[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM reviews WHERE provider_id = ?',
        [providerId]
      );

      return (rows as any[]).map(review => ({
        id: review.id,
        bookingId: review.booking_id,
        clientId: review.client_id,
        providerId: review.provider_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.created_at)
      }));
    } catch (error) {
      console.error('Error getting reviews by provider ID:', error);
      return [];
    }
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO reviews
        (booking_id, client_id, provider_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)`,
        [
          insertReview.bookingId,
          insertReview.clientId,
          insertReview.providerId,
          insertReview.rating,
          insertReview.comment || null
        ]
      );

      const insertId = (result as any).insertId;
      const createdAt = new Date();

      return {
        id: insertId,
        bookingId: insertReview.bookingId,
        clientId: insertReview.clientId,
        providerId: insertReview.providerId,
        rating: insertReview.rating,
        comment: insertReview.comment || null,
        createdAt
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
}

// Create and export the storage instance
export const storage = new MySQLStorage();
