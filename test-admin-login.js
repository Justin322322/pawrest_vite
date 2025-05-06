// Script to test admin login directly
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import fetch from 'node-fetch';

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

// Function to compare passwords
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function testAdminLogin() {
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
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
      [adminUsername]
    );
    
    if (users.length === 0) {
      console.log('Admin user does not exist');
      await connection.end();
      return false;
    }
    
    const adminUser = users[0];
    console.log('Found admin user:', adminUser.username);
    console.log('Admin user details:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      isVerified: adminUser.is_verified
    });
    
    // Try to verify the current password
    try {
      const isPasswordValid = await comparePasswords(adminPassword, adminUser.password);
      console.log('Password valid:', isPasswordValid);
    } catch (error) {
      console.log('Error comparing passwords:', error.message);
    }
    
    // Test API login
    console.log('\nTesting API login...');
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });
      
      console.log('API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
      } else {
        const text = await response.text();
        console.log('Login failed:', text);
      }
    } catch (error) {
      console.error('API request error:', error);
    }
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error testing admin login:', error);
    return false;
  }
}

// Run the function
testAdminLogin()
  .then(success => {
    if (success) {
      console.log('Admin login test completed');
      process.exit(0);
    } else {
      console.error('Admin login test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
