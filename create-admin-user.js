// Script to create an admin user in the MySQL database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// Load environment variables
dotenv.config();

const scryptAsync = promisify(scrypt);

// Database connection details
const host = process.env.MYSQL_HOST || 'localhost';
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';
const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';

// Admin user details
const adminUsername = 'ADMIN';
const adminPassword = 'SECUREADMIN';
const adminEmail = 'admin@modernpetmemorial.com';
const adminFirstName = 'System';
const adminLastName = 'Administrator';
const adminRole = 'admin';

// Function to hash password
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createAdminUser() {
  try {
    console.log(`Connecting to MySQL database at ${host}...`);
    
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName,
    });

    console.log('Connected to MySQL database');
    
    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [adminUsername, adminEmail]
    );
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      await connection.end();
      return true;
    }
    
    // Hash the admin password
    const hashedPassword = await hashPassword(adminPassword);
    
    // Generate full name
    const fullName = `${adminFirstName} ${adminLastName}`;
    
    // Insert admin user
    console.log('Creating admin user...');
    await connection.execute(
      `INSERT INTO users 
      (username, password, email, first_name, last_name, full_name, role, is_verified, terms_accepted) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminUsername,
        hashedPassword,
        adminEmail,
        adminFirstName,
        adminLastName,
        fullName,
        adminRole,
        true, // Admin is verified by default
        true  // Admin accepts terms by default
      ]
    );
    
    console.log('Admin user created successfully');
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}

// Run the function
createAdminUser()
  .then(success => {
    if (success) {
      console.log('Admin user creation completed successfully');
      process.exit(0);
    } else {
      console.error('Admin user creation failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
