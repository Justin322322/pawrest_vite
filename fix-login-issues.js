// Script to fix login issues by ensuring admin user exists and client passwords work
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

async function fixLoginIssues() {
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
    
    // Check if admin user exists
    const [adminUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [adminUsername]
    );
    
    if (adminUsers.length === 0) {
      // Create admin user if it doesn't exist
      console.log('Admin user does not exist. Creating admin user...');
      
      // Hash the admin password
      const hashedPassword = await hashPassword(adminPassword);
      
      // Generate full name
      const fullName = `${adminFirstName} ${adminLastName}`;
      
      // Insert admin user
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
    } else {
      // Update admin user password
      console.log('Admin user exists. Updating password...');
      
      // Hash the admin password
      const hashedPassword = await hashPassword(adminPassword);
      
      // Update admin password
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, adminUsername]
      );
      
      console.log('Admin password updated successfully');
    }
    
    // Fix client user passwords
    console.log('Fixing client user passwords...');
    
    // Get all client users
    const [clientUsers] = await connection.execute(
      'SELECT * FROM users WHERE role = ?',
      ['client']
    );
    
    console.log(`Found ${clientUsers.length} client users`);
    
    // Update each client user with a consistent password hash
    for (const clientUser of clientUsers) {
      // Use the same password as their username for simplicity
      const clientPassword = clientUser.username;
      const hashedPassword = await hashPassword(clientPassword);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, clientUser.id]
      );
      
      console.log(`Updated password for client: ${clientUser.username}`);
    }
    
    console.log('Client passwords updated successfully');
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error fixing login issues:', error);
    return false;
  }
}

// Run the function
fixLoginIssues()
  .then(success => {
    if (success) {
      console.log('Login issues fixed successfully');
      process.exit(0);
    } else {
      console.error('Failed to fix login issues');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
