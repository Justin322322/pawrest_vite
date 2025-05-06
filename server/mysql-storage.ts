import { pool } from './db';
import type {
  User, Service, Booking, Review,
  InsertUser, InsertService, InsertBooking, InsertReview,
  UserRole, BusinessInfo
} from "@shared/schema";
import session from "express-session";
import MySQLStore from "connect-mysql";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

export class MySQLStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    // For now, use memory store for sessions to avoid MySQL session store issues
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    console.log('Using memory session store for reliability');
  }

  // Helper method to hash password - using the same algorithm as in auth.ts
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log(`MySQL Storage: Getting user by ID: ${id}`);

      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      const users = rows as any[];
      if (users.length === 0) {
        console.log(`MySQL Storage: No user found with ID: ${id}`);
        return undefined;
      }

      const user = users[0];
      console.log(`MySQL Storage: Found user by ID: ${user.username}, Role: ${user.role}`);

      // Validate and normalize the role
      let role = user.role;
      if (!role || !Object.values(UserRole).includes(role as UserRole)) {
        console.error(`MySQL Storage: Invalid role for user ID ${id}: ${role}, defaulting to client`);
        role = UserRole.CLIENT;
      }

      console.log(`MySQL Storage: User role after validation: ${role}`);

      return {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: role as UserRole,
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
      console.log(`MySQL Storage: Looking up user by username: ${username}`);

      // Use case-insensitive comparison for username
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
        [username]
      );

      const users = rows as any[];
      if (users.length === 0) {
        console.log(`MySQL Storage: No user found with username: ${username}`);
        return undefined;
      }

      const user = users[0];
      console.log(`MySQL Storage: Found user: ${user.username}, ID: ${user.id}, Role: ${user.role}`);
      console.log(`MySQL Storage: Password hash from database: ${user.password}`);

      // Ensure password is a string
      if (!user.password || typeof user.password !== 'string') {
        console.error(`MySQL Storage: Invalid password format for user ${username}: ${typeof user.password}`);
      }

      // Validate and normalize the role
      let role = user.role;
      if (!role || !Object.values(UserRole).includes(role as UserRole)) {
        console.error(`MySQL Storage: Invalid role for user ${username}: ${role}, defaulting to client`);
        role = UserRole.CLIENT;
      }

      console.log(`MySQL Storage: User role after validation: ${role}`);

      // Convert database row to User object
      const userObject = {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: role as UserRole,
        profileImage: user.profile_image,
        phoneNumber: user.phone_number,
        address: user.address,
        isVerified: Boolean(user.is_verified),
        businessInfo: user.business_info ? JSON.parse(user.business_info) : null,
        termsAccepted: Boolean(user.terms_accepted)
      };

      console.log(`MySQL Storage: Returning user object with role: ${userObject.role}`);

      return userObject;
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
      // Use the password hash provided by auth.ts - don't rehash it
      // This ensures consistent hashing between auth.ts and mysql-storage.ts
      const password = insertUser.password;
      console.log(`MySQL Storage: Creating user with password: ${password}`);

      // Generate full name
      const fullName = `${insertUser.firstName} ${insertUser.lastName}`;

      // Convert business info to JSON string if it exists
      const businessInfo = insertUser.businessInfo ? JSON.stringify(insertUser.businessInfo) : null;

      const [result] = await pool.execute(
        `INSERT INTO users
        (username, password, email, first_name, last_name, full_name, role,
         profile_image, phone_number, address, is_verified, business_info, terms_accepted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          insertUser.username,
          password, // Use the already hashed password from auth.ts
          insertUser.email,
          insertUser.firstName,
          insertUser.lastName,
          fullName,
          insertUser.role,
          insertUser.profileImage || null,
          insertUser.phoneNumber || null,
          insertUser.address || null,
          false,
          businessInfo,
          insertUser.termsAccepted || false
        ]
      );

      const insertId = (result as any).insertId;

      // Get the user we just created to verify it was stored correctly
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [insertId]
      );

      const users = rows as any[];
      if (users.length === 0) {
        throw new Error("User creation failed - user not found after insert");
      }

      const createdUser = users[0];
      console.log(`MySQL Storage: User created with ID ${insertId}, password hash: ${createdUser.password}`);

      return {
        id: insertId,
        username: insertUser.username,
        password: password, // Return the same password hash
        email: insertUser.email,
        firstName: insertUser.firstName,
        lastName: insertUser.lastName,
        fullName,
        role: insertUser.role,
        profileImage: insertUser.profileImage,
        phoneNumber: insertUser.phoneNumber,
        address: insertUser.address,
        isVerified: false,
        businessInfo: insertUser.businessInfo as BusinessInfo | null,
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
        ...insertService
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    try {
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
        throw new Error('No fields to update');
      }

      await pool.execute(
        `UPDATE services SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, id]
      );

      const updatedService = await this.getService(id);
      if (!updatedService) {
        throw new Error('Service not found');
      }

      return updatedService;
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
        ...insertBooking
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

      const updatedBooking = await this.getBooking(id);
      if (!updatedBooking) {
        throw new Error('Booking not found');
      }

      return updatedBooking;
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

      return {
        id: insertId,
        ...insertReview,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
}
