// Script to test password comparison
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import mysql from 'mysql2/promise';
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

async function testPasswordComparison() {
  try {
    console.log('Testing password comparison...');
    
    // Database connection details from .env
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';
    
    // Connect to the database
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName
    });
    
    // Get the user "justin"
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['justin']
    );
    
    if (users.length === 0) {
      console.log('User "justin" not found');
      return false;
    }
    
    const userJustin = users[0];
    console.log('User found:', userJustin.username);
    console.log('Stored password hash:', userJustin.password);
    
    // Test with correct password
    const correctPassword = 'justin';
    const correctResult = await comparePasswords(correctPassword, userJustin.password);
    console.log(`Password comparison with "${correctPassword}": ${correctResult}`);
    
    // Test with incorrect password
    const incorrectPassword = 'wrong_password';
    const incorrectResult = await comparePasswords(incorrectPassword, userJustin.password);
    console.log(`Password comparison with "${incorrectPassword}": ${incorrectResult}`);
    
    // Create a new hash for the correct password
    const newHash = await hashPassword(correctPassword);
    console.log('New hash for the same password:', newHash);
    
    // Test with the new hash
    const newHashResult = await comparePasswords(correctPassword, newHash);
    console.log(`Password comparison with new hash: ${newHashResult}`);
    
    // Update the user's password in the database
    console.log('Updating password in database...');
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [newHash, 'justin']
    );
    
    console.log('Password updated successfully');
    
    // Close the connection
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Error testing password comparison:', error);
    return false;
  }
}

// Run the function
testPasswordComparison()
  .then(success => {
    if (success) {
      console.log('Password comparison test completed successfully');
      process.exit(0);
    } else {
      console.error('Password comparison test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
