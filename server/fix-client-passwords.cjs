// Simple script to reset client passwords using CommonJS
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const util = require('util');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Promisify scrypt
const scryptAsync = util.promisify(crypto.scrypt);

// Hash a password
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetClientPasswords() {
  // Create a connection pool
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'modern_pet_memorial',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Starting client password reset...');
    
    // Get all client users
    const [rows] = await pool.execute(
      "SELECT id, username FROM users WHERE role = 'client'"
    );
    
    console.log(`Found ${rows.length} client accounts to update`);
    
    // Update each client's password to match their username
    for (const client of rows) {
      const username = client.username;
      const hashedPassword = await hashPassword(username);
      
      console.log(`Resetting password for client: ${username} (ID: ${client.id})`);
      console.log(`New password hash: ${hashedPassword}`);
      
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, client.id]
      );
      
      console.log(`Password reset successful for ${username}`);
    }
    
    console.log('Client password reset completed successfully');
  } catch (error) {
    console.error('Error resetting client passwords:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the script
resetClientPasswords()
  .then(() => console.log('Password reset process completed'))
  .catch(err => console.error('Error:', err))
  .finally(() => process.exit());
