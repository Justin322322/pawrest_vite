// Comprehensive fix for the authentication system
import mysql from 'mysql2/promise';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const scryptAsync = promisify(scrypt);

// Function to hash password
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Function to compare passwords
async function comparePasswords(supplied, stored) {
  try {
    // Check if stored password has the correct format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format');
      return false;
    }

    const [hashed, salt] = stored.split(".");

    if (!hashed || !salt) {
      console.error('Invalid password hash components');
      return false;
    }

    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);

    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

async function fixAuthSystem() {
  try {
    console.log('Starting authentication system fix...');
    
    // Database connection details from .env
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';
    
    console.log(`Connection details:
    Host: ${host}
    User: ${user}
    Password: ${password ? '[REDACTED]' : '[EMPTY]'}
    Database: ${dbName}
    `);
    
    // Connect to the database
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName
    });
    
    console.log('Connected to database');
    
    // 1. Fix admin user
    console.log('Checking admin user...');
    const [adminUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['ADMIN']
    );
    
    if (adminUsers.length === 0) {
      // Create admin user if it doesn't exist
      console.log('Admin user does not exist. Creating admin user...');
      
      // Hash the admin password
      const hashedPassword = await hashPassword('SECUREADMIN');
      
      // Insert admin user
      await connection.execute(
        `INSERT INTO users 
        (username, password, email, first_name, last_name, full_name, role, is_verified, terms_accepted) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'ADMIN',
          hashedPassword,
          'admin@modernpetmemorial.com',
          'System',
          'Administrator',
          'System Administrator',
          'admin',
          true,
          true
        ]
      );
      
      console.log('Admin user created successfully');
    } else {
      // Update admin user password
      console.log('Admin user exists. Updating password...');
      
      // Hash the admin password
      const hashedPassword = await hashPassword('SECUREADMIN');
      
      // Update admin password
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'ADMIN']
      );
      
      console.log('Admin password updated successfully');
    }
    
    // 2. Fix all user passwords to match their usernames
    console.log('Fixing all user passwords...');
    
    // Get all users except admin
    const [allUsers] = await connection.execute(
      "SELECT * FROM users WHERE username != 'ADMIN'"
    );
    
    console.log(`Found ${allUsers.length} non-admin users`);
    
    // Update each user's password to match their username
    for (const user of allUsers) {
      // Use the username as the password for simplicity
      const userPassword = user.username;
      const hashedPassword = await hashPassword(userPassword);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`Updated password for user: ${user.username} (role: ${user.role})`);
    }
    
    console.log('All user passwords updated successfully');
    
    // 3. Verify the sessions table exists
    console.log('Checking sessions table...');
    const [tables] = await connection.execute('SHOW TABLES');
    const sessionsTableExists = tables.some(table => table[`Tables_in_${dbName}`] === 'sessions');
    
    if (!sessionsTableExists) {
      console.log('Sessions table does not exist. Creating it...');
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
          expires INT(11) UNSIGNED NOT NULL,
          data MEDIUMTEXT COLLATE utf8mb4_bin,
          PRIMARY KEY (session_id)
        )
      `);
      
      console.log('Sessions table created successfully');
    } else {
      console.log('Sessions table exists');
      
      // Clear existing sessions to force re-login
      await connection.execute('TRUNCATE TABLE sessions');
      console.log('Cleared existing sessions');
    }
    
    // Close the connection
    await connection.end();
    console.log('Database connection closed');
    
    console.log(`
==============================================
AUTHENTICATION SYSTEM FIX COMPLETED SUCCESSFULLY
==============================================

All users can now log in with their username as password.
For example:
- Username: justin
- Password: justin

The admin user can log in with:
- Username: ADMIN
- Password: SECUREADMIN

Please restart your server for the changes to take effect.
    `);
    
    return true;
  } catch (error) {
    console.error('Error fixing authentication system:', error);
    return false;
  }
}

// Run the function
fixAuthSystem()
  .then(success => {
    if (success) {
      console.log('Authentication system fix completed successfully');
      process.exit(0);
    } else {
      console.error('Authentication system fix failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
