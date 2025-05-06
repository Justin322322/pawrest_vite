// Script to fix the admin user password
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
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

// Function to hash password using the exact same method as in auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Function to compare passwords
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function fixAdminPassword() {
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
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [adminUsername]
    );
    
    if (users.length === 0) {
      console.log('Admin user does not exist');
      await connection.end();
      return false;
    }
    
    const adminUser = users[0];
    console.log('Found admin user:', adminUser.username);
    
    // Try to verify the current password
    try {
      const isPasswordValid = await comparePasswords(adminPassword, adminUser.password);
      if (isPasswordValid) {
        console.log('Admin password is already valid');
        await connection.end();
        return true;
      }
    } catch (error) {
      console.log('Error comparing passwords, will update password:', error.message);
    }
    
    // Update the admin password
    console.log('Updating admin password...');
    const hashedPassword = await hashPassword(adminPassword);
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, adminUsername]
    );
    
    console.log('Admin password updated successfully');
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error fixing admin password:', error);
    return false;
  }
}

// Run the function
fixAdminPassword()
  .then(success => {
    if (success) {
      console.log('Admin password fix completed successfully');
      process.exit(0);
    } else {
      console.error('Admin password fix failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
