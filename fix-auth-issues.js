// Script to fix authentication issues
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

// Function to hash password
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function fixAuthIssues() {
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
    
    // 2. Fix all user passwords
    console.log('Fixing all user passwords...');
    
    // Get all users
    const [allUsers] = await connection.execute(
      'SELECT * FROM users'
    );
    
    console.log(`Found ${allUsers.length} users`);
    
    // Update each user with a consistent password hash
    for (const user of allUsers) {
      // Skip admin user as we already fixed it
      if (user.username === 'ADMIN') {
        continue;
      }
      
      // Use the same password as their username for simplicity
      const userPassword = user.username;
      const hashedPassword = await hashPassword(userPassword);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`Updated password for user: ${user.username} (role: ${user.role})`);
    }
    
    console.log('All user passwords updated successfully');
    
    // 3. Verify database structure
    console.log('Verifying database structure...');
    
    // Check if users table has all required columns
    const [columns] = await connection.execute(
      'SHOW COLUMNS FROM users'
    );
    
    const columnNames = columns.map(col => col.Field);
    const requiredColumns = [
      'id', 'username', 'password', 'email', 'first_name', 'last_name', 
      'full_name', 'role', 'is_verified', 'business_info', 'terms_accepted'
    ];
    
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`Missing columns in users table: ${missingColumns.join(', ')}`);
    } else {
      console.log('Users table structure is valid');
    }
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error fixing authentication issues:', error);
    return false;
  }
}

// Run the function
fixAuthIssues()
  .then(success => {
    if (success) {
      console.log('Authentication issues fixed successfully');
      process.exit(0);
    } else {
      console.error('Failed to fix authentication issues');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
